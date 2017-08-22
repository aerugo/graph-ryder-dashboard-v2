'use strict';
const angular = require('angular');

import 'bootstrap';
import 'jquery';
import 'jquery-ui-bundle';


export default angular.module('graphRyderDashboardApp.detailPanel', [])
  .directive('detailPanel', function($http, $timeout) {
    return {
      template: require('./detail-panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        settings: '='
      },
      link: function(scope, element) {
        element.draggable({handle: '.panel-heading', containment: 'body', scroll: false, stack: '.panel',
        start: function() {
          if (element.css('z-index') > 100) {
            element.css('z-index', 10);
          }
        }});
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
              // todo labels[0] could be the generic label
              $http.get('/api/data/getProperties/' + scope.labels[0]).then(response => {
                scope.properties = $(response.data).not(Object.keys(scope.node)).get();
              });
            });
            loaded = true;
          }
        };

        /****** Search for available values ******/
        scope.suggestValue = function (key) {
          if (key) {
            // todo labels[0] could be the generic label
            $http.get('/api/data/getPropertyValue/' + scope.labels[0] + '/' + key).then(propertyValue => {
              scope.values = propertyValue.data;
            });
          }
        };

        /****** Update the element *****/
        scope.update = function() {
          // todo manage the additional field
          $http.put('/api/data/set/' + scope.settings.id, scope.node).then(response => {
            scope.settings.style.display = false; //todo close the panel instead
          });
        };
        $timeout(function () {
          scope.load();
        });
      }
    };
  })
  .name;
