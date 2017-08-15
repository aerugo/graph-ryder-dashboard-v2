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
        scope.choice = function(option) {
          scope.handler({e: {
            type: option.action,
            element: scope.settings.element,
            position: scope.settings.position
          }});
          scope.settings.style.display = false;
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
