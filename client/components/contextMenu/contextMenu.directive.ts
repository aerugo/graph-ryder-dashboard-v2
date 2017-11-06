'use strict';
const angular = require('angular');

export default angular.module('graphRyderDashboardApp.contextMenu', [])
  .directive('contextMenu', function($parse) {
    return {
      template: require('./contextMenu.html'),
      restrict: 'EA',
      replace: true,
      scope: {
        settings: '=',
        handler: '&'
      },
      link: function(scope, element, attrs) {
        if (scope.settings.style.draggable) {
          element.draggable({handle: '.menu-title', containment: 'body', scroll: false, stack: '.panel' });
        }
        scope.choice = function(option) {
          element.remove();
          scope.handler({e: {
            type: option.action,
            key: option.key,
            pid: option.pid,
            aid: option.aid,
            element: scope.settings.element,
            node: scope.settings.node,
            nodes: scope.settings.nodes,
            position: scope.settings.position,
            optionLabel: option.label
          }});
        };

        scope.close = function() {
          element.remove();
        };
        // prevent right click menu
        element.bind('contextmenu', function(event) {
          scope.$apply(function() {
            event.preventDefault();
          });
        });
      }
    };
  })
  .name;
