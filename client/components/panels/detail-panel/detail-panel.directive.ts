'use strict';
const angular = require('angular');
require('jquery');
require('jquery-ui-bundle');


export default angular.module('graphRyderDashboardApp.detailPanel', [])
  .directive('detailPanel', function($http) {
    return {
      template: require('./detail-panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        settings: '='
      },
      link: function(scope, element) {
        element.draggable({handle: ".panel-heading", containment: "body", scroll: false });
        element.resizable({minHeight: 150, minWidth:150});
        let loaded = false;

        /***** Load properties *******/
        scope.load = function(){
          if(!loaded && scope.settings.id) {
            $http.get('/api/data/getLabels/' + scope.settings.id).then(response => {
              scope.labels = response.data;
            });
            $http.get('/api/data/get/' + scope.settings.id).then(response => {
              scope.node = response.data;
              let label = "Person"; // todo need to know generic label vs indatabase
              $http.get('/api/data/getProperties/' + label).then(response => {
                scope.properties =$(response.data).not(Object.keys(scope.node)).get();
              });
            });
            loaded = true;
          }
        };

        /****** Search for available values ******/
        scope.suggestValue = function (key) {
          if(key) {
            let label = "Person"; // todo need to know generic label vs indatabase
            $http.get('/api/data/getPropertyValue/' + label + '/' + key).then(response => {
              scope.values = response.data;
            });
          }
        };

        /****** Update the element *****/
        scope.update = function() {

        };
      }
    };
  })
  .name;
