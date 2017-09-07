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
          nodeActiveBorderSize: 2,
          nodeActiveOuterBorderSize: 3,
          defaultNodeActiveBorderColor: '#fff',
          defaultNodeActiveOuterBorderColor: 'rgb(236, 81, 72)',
          nodeHaloColor: 'rgba(236, 81, 72, 0.2)',
          nodeHaloSize: 25,
          autoCurveSortByDirection: true
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

        scope.$watch('graph', function() {
          if (scope.graph) {
            s.graph.clear();
            s.graph.read(scope.graph);
            sigma.canvas.edges.autoCurve(s);
            s.refresh();
            if (settings.demo || !firstLaunch) {
              sigma.layouts.fruchtermanReingold.start(s);
              firstLaunch = true;
            }
          }
        });
        scope.$watch('graph.action', function() {
          if (scope.graph.action && scope.graph.action !== 'undefined' && scope.graph.action !== '') {
            switch (scope.graph.action.type) {
              case 'addNode':
                s.graph.addNode(scope.graph.action.node);
                break;
              case 'addEdge':
                s.graph.addEdge(scope.graph.action.edge);
                break;
              case 'deleteNode':
                angular.forEach(s.graph.nodes(), function (node) {
                  if (node.neo4j_id === scope.graph.action.targetId) {
                    s.graph.dropNode(node.id);
                  }
                });
                break;
              case 'deleteEdge':
                angular.forEach(s.graph.edges(), function (edge) {
                  if (edge.neo4j_id === scope.graph.action.targetId) {
                    s.graph.dropEdge(edge.id);
                  }
                });
                break;
            }
            sigma.canvas.edges.autoCurve(s);
            s.refresh();
            scope.graph.action = 'undefined';
          }
        });

        /**** Tools *****/
        let activeState = sigma.plugins.activeState(s);
        let keyboard = sigma.plugins.keyboard(s, s.renderers[0]);
        let select = sigma.plugins.select(s, activeState);
        select.bindKeyboard(keyboard);
        let dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);
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
        function renderHalo() {
          s.renderers[0].halo({
            nodes: activeState.nodes()
          });
        }
        s.renderers[0].bind('render', function(e) {
          renderHalo();
        });

        /**** Bindings ****/
        keyboard.bind('32+83', function() {
          if (lasso.isActive) {
            lasso.deactivate();
          } else {
            lasso.activate();
          }
        });
        lasso.bind('selectedNodes', function (e) {
          activeState.dropEdges();
          let nodes = e.data;
          if (!nodes.length) activeState.dropNodes();
          activeState.addNodes(nodes.map(function(n) { return n.id; }));
          setTimeout(function() {
            lasso.deactivate();
            s.refresh({ skipIdexation: true });
          }, 0);
          e.element = scope.settings.element;
          scope.eventHandler({e: e});
          scope.$apply();
        });
        element.bind('contextmenu', function(event) {  // prevent right click menu
          scope.$apply(function() {
            event.preventDefault();
          });
        });
        s.bind('clickNode clickEdge rightClickNode rightClickEdge clickStage rightClickStage leftClickStage hovers', function(e){
          e.element = scope.settings.element;
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
