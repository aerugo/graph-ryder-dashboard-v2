'use strict';
const angular = require('angular');
require('script!linkurious/dist/sigma.min.js');
require('script!linkurious/dist/plugins.min.js');

// todo : https://github.com/Linkurious/linkurious.js/wiki/How-to-integrate-with-Angular.js
export default angular.module('graphRyderDashboardApp.sigma', [])
  .directive('sigma', function($compile, $parse) {
    return {
      restrict: 'E',
      scope: {
        //@ reads the attribute value, = provides two-way binding, & works with functions
        graph: '=',
        instanceId: '@',
        instanceClass: '@',
        settings: '=',
        eventHandler: '&'
      },
      link: function (scope, element, attrs) {

        /****** Inject the template *****/
        $compile(element.contents())(scope);
        element.html('<div id="' + scope.instanceId + '" class="' + scope.instanceClass + '" ></div>');
        let firstLaunch = false;

        /****** Settings *********/
        let settings = { // default settings
          labelThreshold: 7,
          dragNodeStickiness: 0.01,
          nodeBorderSize: 2,
          defaultNodeBorderColor: '#000',
          enableEdgeHovering: true,
          drawEdgeLabels: false,
          animationsTime: 1500,
          zoomDef: 1.1,
          centerOnLoad: true,
          demo: false,
          active: false,
          nodeActiveBorderSize: 2,
          nodeActiveOuterBorderSize: 3,
          defaultNodeActiveBorderColor: '#fff',
          defaultNodeActiveOuterBorderColor: 'rgb(236, 81, 72)',
          nodeHaloColor: 'rgba(236, 81, 72, 0.2)',
          nodeHaloSize: 25,
          autoCurveSortByDirection: true,
          autoRescale: false
        };
        if (scope.settings) {
          Object.keys(scope.settings).forEach(function(key) { settings[key] = scope.settings[key]; });
        }

        /****** Initialize *******/
        let s = new sigma({
          renderer: {
            container: element[0].firstChild,
            type: 'canvas'
          },
          settings: settings
        });
        let conf = {
          animation: {
            node: {
              duration: 800
            },
            edge: {
              duration: 800
            },
            center: {
              duration: 800
            }
          },
          //focusOut: true,
          zoomDef: 1
        };
        let locate = sigma.plugins.locate(s, conf);

        scope.$watch('graph', function() {
          if (scope.graph) {
            s.graph.clear();
            s.graph.read(scope.graph);
            sigma.canvas.edges.autoCurve(s);
            s.refresh();
            locate.center();
          }
        });
        scope.$watch('graph.action', function(newVal) {
          if (newVal && newVal !== 'undefined' && newVal !== '') {
            switch (newVal.type) {
              case 'addNode':
                angular.forEach(scope.graph.action.node, function (node) {
                  node.size = 4;
                  s.graph.addNode(node);
                  activeState.dropNodes();
                  activeState.addNodes([node.id]);
                });
                break;
              case 'addEdge':
                angular.forEach(scope.graph.action.edge, function (edge) {
                  s.graph.addEdge(edge);
                });
                break;
              case 'selection':
                activeState.dropNodes();
                let nodes = [];
                angular.forEach(scope.graph.action.selection, function (node) {
                  angular.forEach(s.graph.nodes(), function (n) {
                    if (n.id === node.id) {
                      activeState.addNodes([node.id]);
                      nodes.push(node.id);
                    }
                  });
                });
                //locate.nodes(nodes);
                break;
              case 'deleteNode':
                angular.forEach(scope.graph.action.targets, function (target) {
                  s.graph.dropNode(target.id);
                });
                break;
              case 'deleteEdge':
                angular.forEach(scope.graph.action.targets, function (target) {
                  s.graph.dropEdge(target.id);
                });
                break;
              case 'reverseEdge':
                let edge = s.graph.edges(scope.graph.action.target);
                s.graph.dropEdge(scope.graph.action.target);
                let tmp = edge.target;
                edge.target = edge.source;
                edge.source = tmp;
                s.graph.addEdge(edge);
                break;
            }
            sigma.canvas.edges.autoCurve(s);
            s.refresh();
            scope.graph.action = 'undefined';
          }
        });

        /**** Tools *****/
        let keyboard = sigma.plugins.keyboard(s, s.renderers[0]);
        let activeState = sigma.plugins.activeState(s);
        let lasso = new sigma.plugins.lasso(s, s.renderers[0], {
          'strokeStyle': 'rgb(236, 81, 72)',
          'lineWidth': 2,
          'fillWhileDrawing': true,
          'fillStyle': 'rgba(236, 81, 72, 0.2)',
          'cursor': 'crosshair'
        });
        sigma.layouts.fruchtermanReingold.configure(s, {
          iterations: 500,
          easing: 'quadraticInOut',
          duration: 1500
        });
        if (settings.active) {
          let select = sigma.plugins.select(s, activeState);
          let dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);
          function renderHalo() {
            s.renderers[0].halo({
              nodes: activeState.nodes()
            });
          }
          s.renderers[0].bind('render', function(e) {
            renderHalo();
          });
          select.init();
          select.bindKeyboard(keyboard);
        } else {
          let dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
        }

        /**** Bindings ****/
        if (settings.active) {
          lasso.bind('selectedNodes', function (e) {
            activeState.dropEdges();
            let nodes = e.data;
            activeState.dropNodes();
            activeState.addNodes(nodes.map(function(n) { return n.id; }));
            setTimeout(function() {
              lasso.deactivate();
              s.refresh({ skipIdexation: true });
            }, 0);
            e.element = scope.settings.element;
            e.data = activeState.nodes();
            scope.eventHandler({e: e});
            scope.$apply();
          });
          var activeNodesCallback = _.debounce(function(e) {
            e.element = scope.settings.element;
            e.data = activeState.nodes();
            scope.eventHandler({e: e});
          });
          var activeEdgesCallback = _.debounce(function(e) {
            e.element = scope.settings.element;
            e.data = activeState.edges();
            scope.eventHandler({e: e});
          });
          activeState.bind('activeNodes', activeNodesCallback);
          activeState.bind('activeEdges', activeEdgesCallback);
        } else {
          lasso.bind('selectedNodes', function (e) {
            e.element = scope.settings.element;
            scope.eventHandler({e: e});
            lasso.deactivate();
            scope.$apply();
          };
        }
        keyboard.bind('32+83', function() {
          if (lasso.isActive) {
            lasso.deactivate();
          } else {
            lasso.activate();
          }
        });
        element.bind('contextmenu', function(event) {  // prevent right click menu
          scope.$apply(function() {
            event.preventDefault();
          });
        });
        s.bind('clickNode clickEdge rightClickNode rightClickEdge clickStage rightClickStage leftClickStage hovers', function(e){
          e.element = settings.element;
          scope.eventHandler({e: e});
          scope.$apply();
        });

        /***** Destroy *****/
        element.on('$destroy', function() {
          s.graph.clear();
        });
      }
    };
  })
  .name;
