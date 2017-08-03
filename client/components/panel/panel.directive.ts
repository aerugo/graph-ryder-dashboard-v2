'use strict';
const angular = require('angular');
require('jquery');
require('jquery-ui-bundle');


export default angular.module('graphRyderDashboardApp.panel', [])
  .directive('panel', function() {
    return {
      template: require('./panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        action: '&',
        settings: '='
      },
      link: function(scope, element) {
        element.draggable({handle: ".panel-heading"});
        element.resizable({minHeight: 150, minWidth:150});
      }
    };
  })
  .name;
