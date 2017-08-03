'use strict';
const angular = require('angular');
require('jquery');
require('jquery-ui-bundle');


export default angular.module('graphRyderDashboardApp.panel', [])
  .directive('panel', function($http) {
    return {
      template: require('./panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        action: '&',
        settings: '='
      },
      link: function(scope, element) {
        element.draggable({handle: ".panel-heading", containment: "body", scroll: false });
        element.resizable({minHeight: 150, minWidth:150});
        let loaded = false;
        scope.load = function(){
          if(scope.settings.type == "details" && !loaded)
          $http.get('/api/data/get/' + scope.settings.id).then(response => {
            scope.node = response.data;
            loaded = true;
          });
        };
      }
    };
  })
  .name;
