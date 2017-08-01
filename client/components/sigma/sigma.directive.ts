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
        width: '@',
        height: '@',
        releativeSizeNode: '='
      },
      link: function (scope, element, attrs) {
        // Let's first initialize sigma:
        var s = new sigma({
          container: divId,
          settings: {
            defaultNodeColor: '#ec5148',
            labelThreshold: 4,
            render: 'webgl'
          }
        });

        scope.$watch('graph', function(newVal,oldVal) {
          s.graph.clear();
          s.graph.read(scope.graph);
          s.refresh();
          if(scope.releativeSizeNode) {
            //this feature needs the plugin to be added
            sigma.plugins.relativeSize(s, 2);
          }
        });

        scope.$watch('width', function(newVal,oldVal) {
          console.log("graph width: "+scope.width);
          element.children().css("width",scope.width);
          s.refresh();
          window.dispatchEvent(new Event('resize')); //hack so that it will be shown instantly
        });
        scope.$watch('height', function(newVal,oldVal) {
          console.log("graph height: "+scope.height);
          element.children().css("height",scope.height);
          s.refresh();
          window.dispatchEvent(new Event('resize'));//hack so that it will be shown instantly
        });

        element.on('$destroy', function() {
          s.graph.clear();
        });
      }
    };
  })
  .name;
