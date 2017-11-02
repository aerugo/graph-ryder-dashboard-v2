'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './graphView.routes';

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
  Auth;
  getCurrentUser: Function;

  /*@ngInject*/
  constructor(Auth, $http, $scope, $compile) {
    this.Auth = Auth;
    this.$http = $http;
    this.$compile = $compile;  // todo clean this
    this.$scope = $scope;
    this.detailPanels = [];
    this.sigmaPanels = [];
    this.settingPanels = [];
    this.footer = {text: 'Graph-Ryder v2.0', labels : []};
    this.contextMenu = { style: { display: false }};
    this.getCurrentUser = Auth.getCurrentUserSync;
  }

  /**** Init the view ****/
  $onInit() {
    this.sigmaPanels.push({
      url: {
        type: '',
        query: ''
      },
      graph: {action: '', selection: []},
      sigmaSettings: {
        demo: false,
        element: 0,
        active: true
      }
    }); // Main graph is id 0
    this.settingPanels.push({
      sigma: this.sigmaPanels[0],
      style: {
        title: 'Main graph',
        display: false,
        icon: 'cog',
        css: 'width: 900px; height: 125px; right: 10px;'
      }
    });
    this.searchPanel = {
      element: 0,
      user: this.getCurrentUser,
      style: {
        title: 'SearchBar',
        display: true,
        icon: 'search',
        css: 'width: 950px; height: 375px; right: 10px;'
      }
    };
    this.addSearchPanel('searchPanel');
    this.addSettingPanel('settingPanels[0]');
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
    angular.element('#contextMenu').remove();
  }

  /**** Event handler *****/
  eventHandler(e) {
    switch (e.type) {
      /***** Sigma events *****/
      case 'rightClickNode':
        /**** Single node *****/
        if (this.sigmaPanels[e.element].graph.selection.length === 1 || this.sigmaPanels[e.element].graph.selection.indexOf(e.data.node) === -1) {
          this.removeContextMenu();
          let title = 'Node ' + e.data.node.label;
          if (title.length > 15) {
            title = title.substring(0, 15) + '...';
          }
          this.contextMenu = {
            style: {
              title: title,
              display: true,
              draggable: true,
              //icon: 'info',
              css: 'top: ' + (e.data.captor.clientY - 25) + 'px; left : ' + (e.data.captor.clientX - 25) + 'px;'
            },
            options: [
              { label: 'Modify / Details', action: 'detail'},
              { label: 'View Neighbours', action: 'neighbour'},
              { label: 'Hide', action: 'deleteNode'}
            ],
            position: {clientY: e.data.captor.clientY, clientX: e.data.captor.clientX},
            node: [{id: e.data.node.id, id: e.data.node.id, label: e.data.node.label}],
            element: e.element
          };
          this.addContextPanel('contextMenu');
        } else {
        /**** Multiple nodes *****/
          this.removeContextMenu();
          let title = 'Selection ' + this.sigmaPanels[e.element].graph.selection.length + ' nodes';
          let options = [];
          if (this.sigmaPanels[e.element].graph.selection.length === 2) {
            options.push({ label: 'Add edge', action: 'addEdge'});
          }
          options.push({ label: 'View interaction', action: 'viewInteraction'}); // todo add interaction View
          options.push({ label: 'Hide', action: 'deleteNode'});
          this.contextMenu = {
            style: {
              title: title,
              display: true,
              draggable: true,
              //icon: 'info',
              css: 'top: ' + (e.data.captor.clientY - 25) + 'px; left : ' + (e.data.captor.clientX - 25) + 'px;'
            },
            options: options,
            position: {clientY: e.data.captor.clientY, clientX: e.data.captor.clientX},
            node: this.sigmaPanels[e.element].graph.selection,
            element: e.element
          };
          this.addContextPanel('contextMenu');
        }
        break;
      case 'rightClickEdge':
        if (this.sigmaPanels[e.element].graph.selection.length === 1 || this.sigmaPanels[e.element].graph.selection.indexOf(e.data.edge) === -1) {
          this.removeContextMenu();
          let title = 'Edge ' + e.data.edge.id;
          if (title.length > 15) {
            title = title.substring(0, 15) + '...';
          }
          this.contextMenu = {
            style: {
              title: title,
              display: true,
              draggable: true,
              //icon: 'info',
              css: 'top: ' + (e.data.captor.clientY - 25) + 'px; left : ' + (e.data.captor.clientX - 25) + 'px;'
            },
            options: [
              {label: 'Modify / Details', action: 'detail'},
              { label: 'Hide', action: 'deleteEdge'}
            ],
            position: {clientY: e.data.captor.clientY, clientX: e.data.captor.clientX},
            node: [{id: e.data.edge.id, label: e.data.edge.label}],
            element: e.element
          };
          this.addContextPanel('contextMenu');
        } else {
          this.removeContextMenu();
          let title = 'Selection ' + this.sigmaPanels[e.element].graph.selection.length + ' edges';
          let options = [{ label: 'Hide', action: 'deleteEdge'}];
          this.contextMenu = {
            style: {
              title: title,
              display: true,
              draggable: true,
              //icon: 'info',
              css: 'top: ' + (e.data.captor.clientY - 25) + 'px; left : ' + (e.data.captor.clientX - 25) + 'px;'
            },
            options: options,
            position: {clientY: e.data.captor.clientY, clientX: e.data.captor.clientX},
            node: this.sigmaPanels[e.element].graph.selection,
            element: e.element
          };
          this.addContextPanel('contextMenu');
        }
        break;
      case 'clickStage':
        this.removeContextMenu();
        break;
      case 'rightClickStage':
        this.removeContextMenu();
        let xy = e.data.renderer.camera.cameraPosition(e.data.captor.x, e.data.captor.y);
        this.contextMenu = {
          style: {
            title: 'Menu graph',
            display: true,
            draggable: true,
            //icon: 'info',
            css: 'top: ' + (e.data.captor.clientY - 25) + 'px; left : ' + (e.data.captor.clientX - 25) + 'px;'
          },
          options: [
            { label: 'Add node', action: 'addNode'},
            { label: 'Apply layout', action: 'layout'},
            { label: 'SearchBar', action: 'search'},
            { label: 'Settings', action: 'settings'}
            ],
          position: {
            clientY: e.data.captor.clientY,
            clientX: e.data.captor.clientX,
            x: xy.x,  // todo find the good position
            y: xy.y
          },
          element: e.element
        };
        this.addContextPanel('contextMenu');
        break;
      case 'leftClickStage' && 'clickEdge':
        this.removeContextMenu();
        break;
      case 'clickNode':
        this.removeContextMenu();
        if (!this.sigmaPanels[e.element].sigmaSettings.active) {
          this.sigmaPanels[0].graph.action = {
            type: 'selection',
            selection: e.data
          };
        }
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
      case 'selectedNodes':
        if (!this.sigmaPanels[e.element].sigmaSettings.active && e.data.length) {
          this.sigmaPanels[0].graph.action = {
            type: 'selection',
            selection: e.data
          };
        }
        break;
      case 'activeNodes':
        this.sigmaPanels[e.element].graph.selection = e.data;
        break;
      case 'activeEdges':
        this.sigmaPanels[e.element].graph.selection = e.data;
        break;

      /***** ContextMenu events *****/
      case 'addNode':
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
        this.detailPanels[id].id = id;
        this.addDetailPanel('detailPanels[' + id + ']');
      break;
      case 'addEdge':
        let id = this.detailPanels.push({
          style: {
            title: 'Create new edge',
            display: true,
            icon: 'plus',
            css: 'width: 350px; height: 550px; top: ' + (e.position.clientY - 25) + 'px; left : ' + (e.position.clientX - 25) + 'px;'
          },
          type: 'createEdge',
          node: e.node,
          element: e.element,
          position: {y: e.position.y, x: e.position.x}
        });
        id--;
        this.detailPanels[id].id = id;
        this.addDetailPanel('detailPanels[' + id + ']');
      break;
      case 'addNodeGo':
        this.sigmaPanels[e.element].graph.action = {
          type: 'addNode',
          node: [{
            id: e.id,
            label: e.label,
            labels: e.labels.toString(),
            color: e.color,
            x: e.position.x,
            y: e.position.y
          }]
        };
      break;
      case 'addEdgeGo':
        this.sigmaPanels[e.element].graph.action = {
          type: 'addEdge',
          edge: [{
            id: e.id,
            label: e.label,
            labels: e.labels.toString(),
            color: e.color,
            source: e.source,
            target: e.target,
            type: 'arrow'
          }]
        };
      break;
      case 'deleteNode':
        this.sigmaPanels[e.element].graph.action = {
            type: 'deleteNode',
            targets: e.node
        };
      break;
      case 'deleteEdge':
        this.sigmaPanels[e.element].graph.action = {
            type: 'deleteEdge',
            targets: e.node
        };
      break;
      case 'detail':
        if (e.node[0].id.charAt(0) === 'd') {
          e.node[0].id = e.node[0].id.substring(3);
        }
        let id = this.detailPanels.push({
          style: {
            title: 'Details ' + e.node[0].id,
            display: true,
            icon: 'info',
            css: 'width: 450px; height: 650px; top: ' + (e.position.clientY - 25) + 'px; left : ' + (e.position.clientX - 25) + 'px;'
          },
          type: 'detail',
          element: e.element,
          id: e.node[0].id,
        });
        id--;
        this.detailPanels[id].panel_id = id;
        this.addDetailPanel('detailPanels[' + id + ']');
      break;
      case 'neighbour':
        let idSigma = this.sigmaPanels.push({
          type: 'sigma',
          url: {
            type: 'getGraphNeighboursById', //todo check the type of the node
            nodeId: e.node[0].id,
            leftLabel: 'Node',
            rightLabel: 'Node',
            edgeLabel: 'Link',
            done: false
          },
          mode: 'panel',
          style: {
            title: 'Neighbours of ' + e.node[0].label,
            display: true,
            icon: 'link',
            css: 'width: 1000px; height: 800px; top: ' + (e.position.clientY - 25) + 'px; left : ' + (e.position.clientX - 25) + 'px;'
          },
          sigmaSettings: {
            demo: false,
            info: 'Graph-Ryder 2.0',
            active: false
          },
          settingsPanelStyle: {
            title: 'Neighbours',
            display: true,
            icon: 'cog',
            css: 'width: 950px; height: 125px; left: 10px;'
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
            css: 'width: 1000px; height: 800px; top: 50px; left : 5px;'
          },
          settingsSigma: {
            demo: false,
            info: 'Graph-Ryder 2.0',
            active: false
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
        this.searchPanel = {
          element: 0,
          style: {
            title: 'SearchBar',
            display: true,
            icon: 'search',
            css: 'width: 950px; height: 375px; right: 10px;'
          }
        };
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
        this.sigmaPanels[e.element].url.done = false;
      break;

      /***** Search bar ******/
      case 'searchQuery':
        this.sigmaPanels[0].url = {
          type: 'getQueryGraph',
          query: e.search,
          directed: e.directed,
          done: false
        };
        break;
      case 'searchQueryDetach':
        let idSigma = this.sigmaPanels.push({
          type: 'sigma',
          url: {
            type: 'getQueryGraph',
            query: e.search,
            directed: e.directed,
            done: false
          },
          mode: 'panel',
          style: {
            title: 'Graph',
            display: true,
            icon: 'search',
            css: 'width: 1000px; height: 800px; top: 50px; left : 5px;'
          },
          sigmaSettings: {
            demo: false,
            info: 'Graph-Ryder 2.0',
            active: false
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
      case 'lastRequest':
        this.Auth.lastRequest(e.request)
          .then(() => {
            console.log('Request successfully changed.');
          })
          .catch(() => {
            console.log('Fail to update the request');
          });
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
