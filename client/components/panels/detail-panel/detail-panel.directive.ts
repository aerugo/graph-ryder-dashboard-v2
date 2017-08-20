'use strict';
const angular = require('angular');

import 'bootstrap';
import 'jquery';
import 'jquery-ui-bundle';


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
        element.draggable({handle: '.panel-heading', containment: 'body', scroll: false, stack: '.panel'});
        element.resizable({minHeight: 150, minWidth: 150});
        let loaded = false;

        /***** Load properties *******/
        scope.load = function(){
          if (!loaded && scope.settings.id) {
            $http.get('/api/data/getLabels/' + scope.settings.id).then(labels => {
              scope.labels = labels.data;
              angular.forEach(scope.labels, function(label) {
                $http.get('/api/model/label/' + label).then(model => {
                  if (model.data.color) {
                    scope.color = model.data.color;
                  }
                });
              });
            });
            $http.get('/api/data/get/' + scope.settings.id).then(response => {
              scope.node = response.data;
              let label = 'Person'; // todo need to know generic label vs indatabase
              $http.get('/api/data/getProperties/' + label).then(response => {
                scope.properties = $(response.data).not(Object.keys(scope.node)).get();
              });
            });
            loaded = true;
          }
        };

        /****** Search for available values ******/
        scope.suggestValue = function (key) {
          if (key) {
            let label = 'Person'; // todo need to know generic label vs indatabase
            $http.get('/api/data/getPropertyValue/' + label + '/' + key).then(propertyValue => {
              scope.values = propertyValue.data;
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
