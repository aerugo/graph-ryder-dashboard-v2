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
        element.draggable({handle: '.menu-title', containment: 'body', scroll: false, stack: '.panel' });
        scope.choice = function(option) {
          element.remove();
          scope.handler({e: {
            type: option.action,
            element: scope.settings.element,
            node: scope.settings.node,
            position: scope.settings.position,
            optionLabel: option.label
          }});
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
