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
        scope.node = {};

        scope.load = function(){
          /***** Load properties *******/
          if (!loaded && scope.settings.id) {
            $http.get('/api/data/getLabels/' + scope.settings.id).then(labels => {
              scope.labels = labels.data;
              angular.forEach(scope.labels, function(label) {
                $http.get('/api/model/label/' + label).then(model => {
                  if (model.data.color) { //todo add additional info like Require and order
                    $http.get('/api/data/get/' + scope.settings.id).then(response => {
                      scope.getProperties(model.data);
                      angular.forEach(model.data.prop, function(p) {
                        if (Object.keys(response.data).indexOf(p) !== -1) {
                          scope.node[p] = response.data[p];
                        }
                        scope.suggestValue(scope.realLabel, p);
                      });
                    });
                    loaded = true;
                  }
                });
              });
            });
          }
          /****** New Item ******/
          if (!loaded && !scope.settings.id) {
            scope.node = {};
            scope.labelsList = [];
            scope.parents = {};
            $http.get('/api/model/').then(model => {
              angular.forEach(model.data, function(label) {
                if (scope.settings.type === 'createNode' && label.children.length === 0  && label.parents.indexOf('Link') === -1 && label.parents.indexOf('Time') === -1 && label.parents.indexOf('Geo') === -1 && label.label !== 'TimeTreeRoot' && label.label !== 'Link') {
                  scope.labelsList.push(label);
                } else if (scope.settings.type === 'createEdge' && label.children.length === 0  && label.parents.indexOf('Link') !== -1) {
                  scope.labelsList.push(label);
                }
              });
              loaded = true;
            });
          }
        };

        scope.getProperties = function (label) {
          scope.realLabel = label;
          if (label.parents) {
            scope.labels = label.parents.concat(label.label);
          }
          if (label.labeling && !Object.keys(scope.node).includes(label.labeling)) {
            scope.node[label.labeling] = '';
          }
          scope.suggestValue(scope.realLabel, label.labeling);
          // angular.element("#" + label.labeling).focus(); // todo does not work
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
          if( key !== '') {
            scope.node[key] = '';
            scope.newkey = '';
            scope.getProperties(scope.realLabel);
            scope.suggestValue(scope.realLabel, key);
            // angular.element("#" + key).focus(); // todo does not work
          }
        };

        /****** Update the element *****/
        scope.update = function() {
          $http.put('/api/data/set/' + scope.settings.id, scope.node).then(response => {
            // todo check the response
            scope.settings.style.display = false; //todo delete the panel instead
          });
        };

        /****** Delete the element *****/
        scope.delete = function() {
          $http.delete('/api/data/' + scope.settings.id).then(response => {
            // todo check the response
            scope.settings.style.display = false; //todo delete the panel instead
            if (scope.labels.indexOf('Link')  === -1) {
              scope.handler({e: {
                type: 'deleteNode',
                node: [{id: scope.settings.id}],
                element: scope.settings.element
              }});
            } else {
              scope.handler({e: {
                type: 'deleteEdge',
                edge: [{id: scope.settings.id}],
                element: scope.settings.element
              }});
            }
          });
        };

        /****** Create the element *****/
        scope.create = function() {
          scope.node.labels = scope.labels;
          $http.post('/api/data/createNode/', scope.node).then(response => {
            scope.settings.style.display = false; //todo delete the panel instead
            if (scope.settings.type === 'createNode') {
              scope.handler({e: {
                type: 'addNodeGo',
                position: scope.settings.position,
                element: scope.settings.element,
                id: response.data,
                label: scope.node[scope.realLabel.labeling],
                labels: scope.node.labels,
                color: scope.realLabel.color
              }});
            } else if (scope.settings.type === 'createEdge') {
              let edge = {id: response.data, source: scope.settings.node[0].id, target: scope.settings.node[1].id}; // todo clean
              $http.post('/api/data/createEdge/', edge).then(response2 => {
                scope.handler({
                  e: {
                    type: 'addEdgeGo',
                    element: scope.settings.element,
                    id: response.data,
                    label: scope.node[scope.realLabel.labeling],
                    labels: scope.node.labels,
                    color: scope.realLabel.color,
                    source: scope.settings.node[0].id,
                    target: scope.settings.node[1].id
                  }
                });
              });
            }
          });
        };

        /****** Load when ready *****/
        $timeout(function () {
          scope.load();
        });
      }
    };
  })
  .name;
