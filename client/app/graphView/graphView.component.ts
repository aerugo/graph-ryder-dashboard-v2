'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
const ngResource = require('angular-resource');

import routes from './graphView.routes';

export class GraphViewComponent {
  $http;
  $compile;
  $scope;
  mainGraph;
  detailPanels;
  sigmaPanels;
  settingPanels;
  contextMenu;

  /*@ngInject*/
  constructor($http, $scope, $compile) {
    this.$http = $http;
    this.$compile = $compile;  // todo clean this
    this.$scope = $scope;
    this.mainGraph = {};
    this.detailPanels = [];
    this.sigmaPanels = [];
    this.settingPanels = [];
    this.contextMenu = {};
  }

  /**** Init the view ****/
  $onInit() {
    this.mainGraph = {
      url: "getGraph/Person/Relation/Person",
      graph: [],
      settings: {
        demo: false,
        info: 'Graph-Ryder 2.0'
      }
    };
    this.settingPanels.push({
      sigma: this.mainGraph,
      style: {
        title: "Main graph",
        display: true,
        icon: "cog",
        css: 'width: 600px; height: 150px; right: 10px;'
      }
    });

    this.addSettingPanel('settingPanels[0]');
    this.refresh();
  }

  /**** Refresh the view *****/
  refresh() {

  }

  /***** Add panels *****/
  addDetailPanel(settings) {
    let panel = document.createElement("detail-panel");
    panel.setAttribute("settings", "ctrl." + settings);
    angular.element('#panel_container').append(panel);
    this.$compile(panel)(this.$scope);
  }

  addSigmaPanel(settings) {
    let panel = document.createElement("sigma-panel");
    panel.setAttribute("settings", "ctrl." + settings);
    panel.setAttribute("listener", "ctrl.eventHandler(e)");
    angular.element('#panel_container').append(panel);
    this.$compile(panel)(this.$scope);
  }

  addSettingPanel(settings) {
    let panel = document.createElement("setting-panel");
    panel.setAttribute("settings", "ctrl." + settings);
    angular.element('#panel_container').append(panel);
    this.$compile(panel)(this.$scope);
  }

  addContextPanel(settings) {
    let menu = document.createElement("context-menu");
    menu.setAttribute("settings", "ctrl." + settings);
    menu.setAttribute("handler", "ctrl.actionHandler(e)");
    angular.element('#contextMenu_container').append(menu);
    this.$compile(menu)(this.$scope);
  }

  /**** Event handler *****/
  eventHandler(e) {
    switch(e.type){
      case 'clickNode':
        if(e.data.captor.ctrlKey) {
          let id = this.detailPanels.push({
            style: {
              title: "Details " + e.data.node.label,
              display: true,
              icon: "info",
              css: 'width: 350px; height: 550px; top: '+ (e.data.captor.clientY - 25) +'px; left : '+ (e.data.captor.clientX -25) +'px;'
            },
            type: 'detail',
            id: e.data.node.neo4j_id
          });
          id--;
          this.addDetailPanel("detailPanels["+ id +"]");
        }
        break;
      case 'rightClickNode':
        this.contextMenu = {
          style: {
            title: "Menu " + e.data.node.label,
            display: true,
            //icon: "info",
            css: 'top: '+ (e.data.captor.clientY - 25) +'px; left : '+ (e.data.captor.clientX -25) +'px;'
        },
          options: [
            { label: "Modify / Details", action: "detail"},
            { label: "View Neighbours", action: "neighbour"}
          ],
          position: {clientY: e.data.captor.clientY, clientX: e.data.captor.clientX},
          element: {neo4j_id: e.data.node.neo4j_id, label: e.data.node.label}
        };
        this.addContextPanel("contextMenu");
        break;
      case 'clickStage' || 'rightClickStage':
        this.contextMenu.style.display = false;
        break;
    }
  }

  actionHandler(e) {
    switch(e.type){
      case 'detail':
        let id = this.detailPanels.push({
          style: {
            title: "Details " + e.element.label,
            display: true,
            icon: "info",
            css: 'width: 350px; height: 550px; top: '+ (e.position.clientY - 25) +'px; left : '+ (e.position.clientX -25) +'px;'
          },
          type: 'detail',
          id: e.element.neo4j_id,
        });
        id--;
        this.addDetailPanel("detailPanels["+ id +"]");
      break;
      case 'neighbour':
        let id = this.sigmaPanels.push({
          type: 'sigma',
          id: "test",
          url: "getGraphNeighboursById/"+ e.element.neo4j_id +"/Link/Person", //todo check the type of the node
          mode: "panel",
          style: {
            title: "Sigma",
            display: true,
            icon: "link",
            css: 'width: 600px; height: 500px;'
          },
          sigmaSettings: {
            demo: true
          }
        });
        id--;
        this.addSigmaPanel('sigmaPanels['+ id +']');
        break;
    }
  }
}

export default angular.module('graphRyderDashboardApp.graphView', [uiRouter])
  .config(routes)
  .component('graphView', {
    template: require('./graphView.html'),
    controller: GraphViewComponent,
    controllerAs: 'ctrl'
  })
  .name;
