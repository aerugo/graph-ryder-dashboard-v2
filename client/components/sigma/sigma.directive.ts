'use strict';
const angular = require('angular');
require('script!linkurious/dist/sigma.min.js');
require('script!linkurious/dist/plugins.min.js');

// todo : https://github.com/Linkurious/linkurious.js/wiki/How-to-integrate-with-Angular.js
export default angular.module('graphRyderDashboardApp.sigma', [])
  .directive('sigma', function() {
    let divId = 'sigmjs-dir-container-'+Math.floor((Math.random() * 999999999999))+'-'+Math.floor((Math.random() * 999999999999))+'-'+Math.floor((Math.random() * 999999999999));
    return {
      restrict: 'E',
      template: '<div id="'+divId+'" class="sigma-instance" style="width: 100%;height: 90vh;"></div>',
      scope: {
        //@ reads the attribute value, = provides two-way binding, & works with functions
        graph: '=',
        info: '='
      },
      link: function (scope, element, attrs) {
        // Let's first initialize sigma:
        let s = new sigma({
          renderer: {
            container: divId,
            type: 'canvas'
          },
          settings: {
            defaultNodeColor: '#ec5148',
            labelThreshold: 10,
            dragNodeStickiness: 0.01,
            nodeBorderSize: 2,
            defaultNodeBorderColor: '#000',
            enableEdgeHovering: true,
            edgeHoverHighlightNodes: 'circle',
          }
        });
        // console.log(plugins_locate);
        scope.$watch('graph', function() {
          if(scope.graph) {
            s.graph.clear();
            s.graph.read(scope.graph);
            s.refresh();
          }
        });


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
          scope.info = "x: " + e.data.captor.x + " y: " + e.data.captor.y; //todo: get rapid info on element
          scope.$apply();
        });

        lasso.bind('selectedNodes', function(e){;
          console.log(e);
        });

        element.on('$destroy', function() {
          s.graph.clear();
        });
      }
    };
  })
  .name;
