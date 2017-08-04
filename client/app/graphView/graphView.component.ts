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
  detailPanels = [];
  sigmaPanels = [];

  /*@ngInject*/
  constructor($http, $scope, $compile) {
    this.$http = $http;
    this.$compile = $compile;  // todo clean this
    this.$scope = $scope;
    this.mainGraph = {};
    this.detailPanels = [];
    this.sigmaPanels = [];
  }

  /**** Init the view ****/
  $onInit() {
    this.mainGraph = {
      url: "Person/Relation/Person",
      graph: [],
      settings: {
        demo: true
      }
    };
    this.sigmaPanels.push({
      type: 'sigma',
      id: 'test',
      url: "Person/Financial/Person",
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
    this.addSigmaPanel('sigmaPanels[0]');
    this.refresh();
  }

  /**** Refresh the view *****/
  refresh() {
    this.$http.get('/api/tulip/getGraph/', {params:{"url": this.mainGraph.url}}).then(response => {
      this.mainGraph.graph = response.data;
    });
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
          this.addDetailPanel("detailPanels["+ id +"]");
        }
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
