'use strict';
const angular = require('angular');
const sigma = require('linkurious');

// todo : https://github.com/Linkurious/linkurious.js/wiki/How-to-integrate-with-Angular.js
export default angular.module('graphRyderDashboardApp.sigma', [])
  .directive('sigma', function() {
    var divId = 'sigmjs-dir-container-'+Math.floor((Math.random() * 999999999999))+'-'+Math.floor((Math.random() * 999999999999))+'-'+Math.floor((Math.random() * 999999999999));
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
        var s = new sigma({
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

        scope.$watch('graph', function() {
          if(scope.graph) {
            s.graph.clear();
            s.graph.read(scope.graph);
            s.refresh();
          }
        });

         /**** Events ****/
        s.bind('clickNode clickEdge hovers', function(e){
          scope.info = "x: " + e.data.captor.x + " y: " + e.data.captor.y;
          scope.$apply();
        });


        element.on('$destroy', function() {
          s.graph.clear();
        });
      }
    };
  })
  .name;
