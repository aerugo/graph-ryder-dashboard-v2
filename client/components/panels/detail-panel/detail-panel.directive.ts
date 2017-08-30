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
        settings: '=',
        handler: '&'
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
        scope.values = {};
        scope.newkey = '';

        /***** Load properties *******/
        scope.load = function(){
          if (!loaded && scope.settings.id) {
            $http.get('/api/data/getLabels/' + scope.settings.id).then(labels => {
              scope.labels = labels.data;
              angular.forEach(scope.labels, function(label) {
                $http.get('/api/model/label/' + label).then(model => {
                  if (model.data.color) {
                    $http.get('/api/data/get/' + scope.settings.id).then(response => {
                      scope.node = response.data;
                      scope.getProperties(model.data);
                      angular.forEach(Object.keys(scope.node), function(key) {
                        scope.suggestValue(scope.realLabel, key);
                      });
                    });
                    loaded = true;
                  }
                });
              });
            });
          }
          if (!loaded && !scope.settings.id) {
            scope.node = {};
            $http.get('/api/model/').then(model => {
              scope.labelsList = model.data;
              loaded = true;
            });
          }
        };

        scope.getProperties = function (label) {
          scope.realLabel = label;
          scope.labels = [label.label];
          scope.node[label.labeling] = '';
          scope.suggestValue(scope.realLabel, label.labeling);
          angular.element("#" + label.labeling).focus(); // todo does not work
          $http.get('/api/data/getProperties/' + label.label).then(response => {
            scope.properties = $(response.data).not(Object.keys(scope.node)).get();
          });
        };

        /****** Search for available values ******/
        scope.suggestValue = function (label, key) {
          if (key) {
            $http.get('/api/data/getPropertyValue/' + label.label + '/' + key).then(propertyValue => {
              scope.values[key] = propertyValue.data;
            });
          }
        };

        scope.addNewKey = function (key) {
          scope.node[key] = '';
          scope.getProperties(scope.realLabel);
          scope.suggestValue(scope.realLabel, key);
          angular.element("#" + key).focus(); // todo does not work
        };

        /****** Update the element *****/
        scope.update = function() {
          $http.put('/api/data/set/' + scope.settings.id, scope.node).then(response => {
            // todo check the response
            scope.settings.style.display = false; //todo delete the panel instead
          });
        };

        /****** Create the element *****/
        scope.create = function() {
          scope.node.labels = scope.labels;
          $http.post('/api/data/create/', scope.node).then(response => {
            scope.settings.style.display = false; //todo delete the panel instead
            console.log(response);
            scope.handler({e: {
              type: 'addGo',
              position: scope.settings.position,
              element: scope.settings.element,
              node: response.data,
              label: scope.node[scope.realLabel.labeling],
              color: scope.realLabel.color
            }});
          });
        };
        $timeout(function () {
          scope.load();
        });
      }
    };
  })
  .name;
