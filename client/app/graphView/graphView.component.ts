'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './graphView.routes';
import {isUndefined} from 'util';

export class GraphViewComponent {
  $http;
  $compile;
  $scope;
  detailPanels;
  sigmaPanels;
  settingPanels;
  searchPanel;
  footer;
  contextMenu;

  /*@ngInject*/
  constructor($http, $scope, $compile) {
    this.$http = $http;
    this.$compile = $compile;  // todo clean this
    this.$scope = $scope;
    this.detailPanels = [];
    this.sigmaPanels = [];
    this.settingPanels = [];
    this.footer = {text: 'Graph-Ryder v2.0', labels : []};
    this.contextMenu = { style: { display: false }};
  }

  /**** Init the view ****/
  $onInit() {
    this.sigmaPanels.push({
      url: {
        type: 'getGraph',
        leftLabel: 'Person',
        rightLabel: 'Person',
        edgeLabel: 'Financial'
      },
      graph: {new: []},
      settings: {
        demo: false,
        element: 0
      }
    }); // Main graph is id 0
    this.settingPanels.push({
      sigma: this.sigmaPanels[0],
      style: {
        title: 'Main graph',
        display: true,
        icon: 'cog',
        css: 'width: 700px; height: 125px; right: 10px;'
      }
    });
    this.searchPanel = {
      style: {
        title: 'SearchBar',
        display: false,
        icon: 'search',
        css: 'width: 950px; height: 275px; left: 10px;'
      }
    };
    this.addSettingPanel('settingPanels[0]');
    this.addSearchPanel('searchPanel');
  }

  /***** Add panels *****/
  addDetailPanel(settings) {
    let panel = document.createElement('detail-panel');
    panel.setAttribute('settings', 'ctrl.' + settings);
    panel.setAttribute('handler', 'ctrl.eventHandler(e)');
    angular.element('#panel_container').append(panel);
    this.$compile(panel)(this.$scope);
  }
  addSigmaPanel(settings) {
    let panel = document.createElement('sigma-panel');
    panel.setAttribute('settings', 'ctrl.' + settings);
    panel.setAttribute('handler', 'ctrl.eventHandler(e)');
    angular.element('#panel_container').append(panel);
    this.$compile(panel)(this.$scope);
  }
  addSettingPanel(settings) {
    let panel = document.createElement('setting-panel');
    panel.setAttribute('settings', 'ctrl.' + settings);
    panel.setAttribute('handler', 'ctrl.eventHandler(e)');
    angular.element('#panel_container').append(panel);
    this.$compile(panel)(this.$scope);
  }
  addSearchPanel(settings) {
    let panel = document.createElement('search-panel');
    panel.setAttribute('settings', 'ctrl.' + settings);
    panel.setAttribute('handler', 'ctrl.eventHandler(e)');
    angular.element('#panel_container').append(panel);
    this.$compile(panel)(this.$scope);
  }
  addContextPanel(settings) {
    let menu = document.createElement('context-menu');
    menu.setAttribute('settings', 'ctrl.' + settings);
    menu.setAttribute('handler', 'ctrl.eventHandler(e)');
    menu.setAttribute('id', 'contextMenu');
    angular.element('#contextMenu_container').append(menu);
    this.$compile(menu)(this.$scope);
  }

  removeContextMenu() {
    if (isUndefined(angular.element('#contextMenu')) === false) {
      angular.element('#contextMenu').remove();
    }
  }

  /**** Event handler *****/
  eventHandler(e) {
    switch (e.type) {
      /***** Sigma events *****/
      case 'rightClickNode':
        this.removeContextMenu();
        let title = 'Node ' + e.data.node.label;
        if (title.length > 15) {
          title = title.substring(0, 15) + '...';
        }
        this.contextMenu = {
          style: {
            title: title,
            display: true,
            //icon: 'info',
            css: 'top: ' + (e.data.captor.clientY - 25) + 'px; left : ' + (e.data.captor.clientX - 25) + 'px;'
        },
          options: [
            { label: 'Modify / Details', action: 'detail'},
            { label: 'View Neighbours', action: 'neighbour'}
          ],
          position: {clientY: e.data.captor.clientY, clientX: e.data.captor.clientX},
          node: {neo4j_id: e.data.node.neo4j_id, label: e.data.node.label},
          element: e.element
        };
        this.addContextPanel('contextMenu');
        break;
      case 'rightClickEdge':
        this.removeContextMenu();
        let title = 'Edge ' + e.data.edge.neo4j_id;
        if (title.length > 15) {
          title = title.substring(0, 15) + '...';
        }
        this.contextMenu = {
          style: {
            title: title,
            display: true,
            //icon: 'info',
            css: 'top: ' + (e.data.captor.clientY - 25) + 'px; left : ' + (e.data.captor.clientX - 25) + 'px;'
        },
          options: [
            { label: 'Modify / Details', action: 'detail'}
          ],
          position: {clientY: e.data.captor.clientY, clientX: e.data.captor.clientX},
          element: {neo4j_id: e.data.edge.neo4j_id, label: e.data.edge.label}
        };
        this.addContextPanel('contextMenu');
        break;
      case 'clickStage':
        this.removeContextMenu();
        break;
      case 'rightClickStage':
        this.removeContextMenu();
        this.contextMenu = {
          style: {
            title: 'Menu graph',
            display: true,
            //icon: 'info',
            css: 'top: ' + (e.data.captor.clientY - 25) + 'px; left : ' + (e.data.captor.clientX - 25) + 'px;'
          },
          options: [
            { label: 'Add node', action: 'add'},
            { label: 'Apply layout', action: 'layout'},
            { label: 'SearchBar', action: 'search'},
            { label: 'Settings', action: 'settings'}
            ],
          position: {
            clientY: e.data.captor.clientY,
            clientX: e.data.captor.clientX,
            x: e.data.captor.x,
            y: e.data.captor.y
          },
          element: e.element
        };
        this.addContextPanel('contextMenu');
        break;
      case 'hovers':
        if (e.data.enter.nodes.length) {
          let footer = {text: e.data.enter.nodes[0].label, labels: []};
          let http = this.$http;
          angular.forEach(e.data.enter.nodes[0].labels.split(','), function(label) {
            label = label.replace('[', '').replace(']', '').replace("'", '').replace("'", '').replace(' ', '');
            http.get('/api/model/label/' + label).then(model => {
              if (model.data.color) {
                footer.labels.push({
                  label: label,
                  color: model.data.color,
                  labeling: model.data.labeling
                });
              }
            });
          });
          this.footer = footer;
        } else if (e.data.enter.edges.length) {
          let footer = {text: e.data.enter.edges[0].label, labels: []};
          let http = this.$http;
          angular.forEach(e.data.enter.edges[0].labels.split(','), function(label) {
            label = label.replace('[', '').replace(']', '').replace("'", '').replace("'", '').replace(' ', '');
            http.get('/api/model/label/' + label).then(model => {
              if (model.data.color) {
                footer.labels.push({
                  label: label,
                  color: model.data.color,
                  labeling: model.data.labeling
                });
              }
            });
          });
          this.footer = footer;
        }
        break;

      /***** ContextMenu events *****/
      case 'add':
        let id = this.detailPanels.push({
          style: {
            title: 'Create new node',
            display: true,
            icon: 'plus',
            css: 'width: 350px; height: 550px; top: ' + (e.position.clientY - 25) + 'px; left : ' + (e.position.clientX - 25) + 'px;'
          },
          type: 'createNode',
          element: e.element,
          position: {y: e.position.y, x: e.position.x}
        });
        id--;
        this.addDetailPanel('detailPanels[' + id + ']');
      break;
      case 'addGo':
        this.sigmaPanels[e.element].graph.action = {
          type: 'addNode',
          node: {
            id: e.node,
            neo4j_id: e.node,
            label: e.label,
            color: e.color,
            x: e.position.x,
            y: e.position.y
          }
        };
      break;
      case 'delete':
          this.sigmaPanels[e.element].graph.action = {
            type: 'delete',
            targetId: e.target
        };
      break;
      case 'detail':
        let id = this.detailPanels.push({
          style: {
            title: 'Details ' + e.node.label,
            display: true,
            icon: 'info',
            css: 'width: 350px; height: 550px; top: ' + (e.position.clientY - 25) + 'px; left : ' + (e.position.clientX - 25) + 'px;'
          },
          type: 'detail',
          element: e.element,
          id: e.node.neo4j_id,
        });
        id--;
        this.addDetailPanel('detailPanels[' + id + ']');
      break;
      case 'neighbour':
        let idSigma = this.sigmaPanels.push({
          type: 'sigma',
          url: {
            type: 'getGraphNeighboursById', //todo check the type of the node
            nodeId: e.element.neo4j_id,
            leftLabel: 'Person',
            rightLabel: 'Person',
            edgeLabel: 'Link'
          },
          mode: 'panel',
          style: {
            title: 'Neighbours of ' + e.element.label,
            display: true,
            icon: 'link',
            css: 'width: 800px; height: 700px; top: ' + (e.position.clientY - 25) + 'px; left : ' + (e.position.clientX - 25) + 'px;'
          },
          sigmaSettings: {
            demo: false,
            info: 'Graph-Ryder 2.0'
          },
          settingsPanelStyle: {
            title: 'Neighbours',
            display: false,
            icon: 'cog',
            css: 'width: 750px; height: 125px; left: 10px;'
          }
        });
        idSigma--;
        this.sigmaPanels[idSigma].element = idSigma;
        this.addSigmaPanel('sigmaPanels[' + idSigma + ']');
        break;
      case 'detach':
        let idSigma = this.sigmaPanels.push({
          type: 'sigma',
          url: e.url,
          mode: 'panel',
          style: {
            title: 'Graph',
            display: true,
            icon: 'link',
            css: 'width: 800px; height: 700px; top: 50px; left : 5px;'
          },
          sigmaSettings: {
            demo: false,
            info: 'Graph-Ryder 2.0'
          },
          settingsPanelStyle: {
            title: 'Graph',
            display: false,
            icon: 'cog',
            css: 'width: 750px; height: 125px; top: 50px; left: 0px;'
          }
        });
        idSigma--;
        this.sigmaPanels[idSigma].element = idSigma;
        this.addSigmaPanel('sigmaPanels[' + idSigma + ']');
        break;
      case 'settings':
        if (e.element === 0) {
          this.settingPanels[e.element].style.display = true;
          this.settingPanels[e.element].style.css = 'width: 700px; height: 150px; top: ' + (e.position.clientY - 25) + 'px; left : ' + (e.position.clientX - 25) + 'px; z-index: 110;';
        } else {
          this.sigmaPanels[e.element].settingsPanelStyle.display = true;
        }
        break;
      case 'search':
        this.searchPanel.style.display = true;
        break;
      case 'layout':
        this.$http.get('/api/tulip/getLayouts').then(model => {
          let options = [];
          angular.forEach(model.data, function(layout) {
            options.push({label: layout, action: 'layoutGo'});
          });
          this.contextMenu = {
            style: {
              title: 'Layouts ',
              display: true,
              //icon: 'info',
              css: 'top: ' + (e.position.clientY - 25) + 'px; left : ' + (e.position.clientX - 25) + 'px;'
            },
            options: options,
            position: {clientY: e.position.clientY, clientX: e.position.clientX},
            element: e.element
          };
          this.addContextPanel('contextMenu');
        });
        break;
      case 'layoutGo':
        this.sigmaPanels[e.element].url.layout = e.optionLabel;
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
