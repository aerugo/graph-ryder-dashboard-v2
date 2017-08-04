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
          if(scope.settings.type == "details" && !loaded && scope.settings.id) {
            $http.get('/api/data/getLabels/' + scope.settings.id).then(response => {
              scope.labels = response.data;
            });
            $http.get('/api/data/get/' + scope.settings.id).then(response => {
              scope.node = response.data;
              let label = "Person"; // todo need to know generic label vs indatabase
              $http.get('/api/data/getProperties/' + label).then(response => {
                scope.properties =$(response.data).not(Object.keys(scope.node)).get();
                // scope.settings.info = scope.properties;
              });
            });
            loaded = true;
          }
        };

        scope.suggestValue = function (key) {
          if(key) {
            let label = "Person"; // todo need to know generic label vs indatabase
            $http.get('/api/data/getPropertyValue/' + label + '/' + key).then(response => {
              scope.values = response.data;
              // scope.settings.info = scope.values;
            });
          }
        };
      }
    };
  })
  .name;
