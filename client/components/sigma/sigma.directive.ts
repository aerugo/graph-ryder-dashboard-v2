'use strict';
const angular = require('angular');
require('script!linkurious/dist/sigma.min.js');
require('script!linkurious/dist/plugins.min.js');

// todo : https://github.com/Linkurious/linkurious.js/wiki/How-to-integrate-with-Angular.js
export default angular.module('graphRyderDashboardApp.sigma', [])
  .directive('sigma', function($compile) {
    return {
      restrict: 'E',
      scope: {
        //@ reads the attribute value, = provides two-way binding, & works with functions
        graph: '=',
        info: '=',
        instanceId: '@',
        instanceClass: '@',
        settings: '='
      },
      link: function (scope, element, attrs) {
        /****** Inject the template *****/

        $compile(element.contents())(scope);
        element.html('<div id="'+ scope.instanceId +'" class="'+ scope.instanceClass +'" ></div>');

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
          centerOnLoad: true
        };
        if(scope.settings)
          Object.keys(scope.settings).forEach(function(key) { settings[key] = scope.settings[key]; });

        /****** Initialize *******/
        let s = new sigma({
          renderer: {
            container: element[0].firstChild,
            type: 'canvas'
          },
          settings: settings
        });
        // demo mode
        if(settings.demo) {
          sigma.layouts.fruchtermanReingold.configure(s, {
            iterations: 500,
            easing: 'quadraticInOut',
            duration: 1500
          });
        }
        // console.log(plugins_locate);
        scope.$watch('graph', function() {
          if(scope.graph) {
            s.graph.clear();
            s.graph.read(scope.graph);
            s.refresh();
            if(settings.demo)
              sigma.layouts.fruchtermanReingold.start(s);
          }
        });

        /**** Tools *****/
        let dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
        let lasso = new sigma.plugins.lasso(s, s.renderers[0], {
          'strokeStyle': 'black',
          'lineWidth': 2,
          'fillWhileDrawing': true,
          'fillStyle': 'rgba(41, 41, 41, 0.2)',
          'cursor': 'crosshair'
        });
        // lasso.activate();



        /**** Events ****/
        s.bind('clickNode clickEdge hovers', function(e){
          if(scope.info) {
            scope.info = "x: " + e.data.captor.x + " y: " + e.data.captor.y; //todo: get rapid info on element
            scope.$apply();
          }
        });

        lasso.bind('selectedNodes', function(e){;
          console.log(e);
        });

          // element.on('$destroy', function() {
          //   s.graph.clear();
          // });
      }
    };
  })
  .name;
