'use strict';
const angular = require('angular');

export default angular.module('graphRyderDashboardApp.contextMenu', [])
  .directive('contextMenu', function($parse, $http) {
    return {
      template: require('./contextMenu.html'),
      restrict: 'EA',
      replace: true,
      scope: {
        settings: '=',
        handler: '&'
      },
      link: function(scope, element, attrs) {
        if (scope.settings.style.draggable) {
          element.draggable({handle: '.menu-title', containment: '#main-view', scroll: false, stack: '.panel' });
        }
        if (scope.settings.fields) {
          scope.types = [];
          scope.type = '';
          scope.props = [];
          scope.prop = '';
          scope.values = [];

          $http.get('/api/model/').then(labels => {
            angular.forEach(labels.data  , function (label, key) {
              if (label.parents.indexOf('Attribute') !== -1) {
                scope.types.push({key: key, name: label.label});
              }
            });
          });
        }

        scope.typeSelected = function (item, model, label) {
          scope.type = label;
          $http.get('/api/data/getPropertiesByLabel/' + label).then(properties => {
            angular.forEach(properties.data, function (property, key) {
              scope.props.push({key: key, name: property});
            });
          });
        };

        scope.propSelected = function (item, model, label) {
          scope.prop = label;
          $http.get('/api/data/getPropertyValueAndId/' + scope.type + '/' + scope.prop).then(values => {
            angular.forEach(values.data, function (value) {
              scope.values.push({key: value.id, name: value.value});
            });
          });
        };

        scope.resetValues = function () {
          scope.values = [];
        };

        scope.valueSelected = function (item, model, label) {
          if (scope.settings.fields[0].action === 'addAttrGo') {
            scope.settings.fields[0].key = scope.type;
            scope.settings.fields[0].label = label;
          }
          scope.settings.fields[0].aid = item.key;
          scope.choice(scope.settings.fields[0]);
        };
        scope.choice = function(option) {
          element.remove();
          scope.handler({e: {
            type: option.action,
            key: option.key,
            pid: option.pid,
            aid: option.aid,
            element: scope.settings.element,
            node: scope.settings.node,
            nodes: scope.settings.nodes,
            position: scope.settings.position,
            optionLabel: option.label
          }});
        };

        scope.close = function() {
          element.remove();
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
