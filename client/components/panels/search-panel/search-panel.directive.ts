'use strict';
const angular = require('angular');

export default angular.module('graphRyderDashboardApp.searchPanel', [])
  .directive('searchPanel', function($http) {
    return {
      template: require('./search-panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        settings: '=',
        handler: '@'
      },
      link: function(scope, element, attrs) {
        element.draggable({handle: '.panel-heading', containment: 'body', scroll: false, stack: '.panel',
          start: function() {
            if (element.css('z-index') > 100) {
              element.css('z-index', 10);
            }
          }});
        element.resizable({minHeight: 150, minWidth: 150}); // todo refresh on resize

        scope.placeholder = "Search ...";
        scope.searchQuery = '';
        scope.searchParams = [];
        scope.parameters = [];
        scope.step = 0;

        scope.init = function () {
          scope.searchQuery = '';
          scope.parameters = [];
          if (scope.step === 0) {
            $http.get('/api/model/').then(labels => {
              angular.forEach(labels.data  , function (label, key) {
                scope.parameters.push({ key: label.label, name: label.label, placeholder: label.label, color: label.color });
              });
            });
          }
          else if (scope.step === 1) {
            $http.get('/api/data/getProperties/' + scope.label).then(properties => {
              angular.forEach(properties.data, function (property, key) {
                scope.parameters.push({key: property, name: property, placeholder: property, color: "rgb(127,183,51)"});
              });
              scope.parameters.push({key: '*', name: '*', placeholder: '*', color: "rgb(127,183,51)"});
            });
          }
          else if (scope.step === 2) {
            $http.get('/api/data/getPropertyValue/' + scope.label + '/' + scope.prop).then(values => {
              angular.forEach(values.data, function (value, key) {
                scope.parameters.push({key: value, name: value, placeholder: value, color: "rgb(127,183,51)"});
              });
              scope.parameters.push({key: '*', name: '*', placeholder: '*', color: "rgb(127,183,51)"});
            });
          }
          scope.step++;
        };
        scope.searchQueryTypeaheadOnSelect =  function (index) {
          if (scope.step === 1) {
            scope.searchParams.push({
              name: index.name,
              label: index.key,
              color: index.color
            });
            scope.label = index.key;
            scope.init();
          }
          else if (scope.step === 2) {
            scope.searchParams[scope.searchParams.length-1].name += "->" + index.key;
            scope.searchParams[scope.searchParams.length-1].property = index.key;
            if (index.key === '*') {
              scope.step = 0;
            }
            else {
              scope.prop = index.key;
            }
            scope.init();
          }
          else if (scope.step === 3) {
            scope.searchParams[scope.searchParams.length-1].name += "->" + index.key;
            scope.searchParams[scope.searchParams.length-1].value = index.key;
            scope.label = '';
            scope.prop = '';
            scope.step = 0;
            scope.init();
          }
        };

        scope.removeSearchParam = function (index) {
          scope.searchParams.splice(index, 1);
          scope.step = 0;
          scope.parameters = [];
          scope.searchQuery = '';
          scope.init();
        };

        scope.removeAll = function () {
          scope.searchParams = [];
          scope.step = 0;
          scope.parameters = [];
          scope.searchQuery = '';
          scope.init();
        };

        scope.action = function () {
          console.log(scope.searchParams);
        };

        scope.focus  = function(){
          angular.element("#searchBox").focus();
        };

        scope.init();
      }
    };
  })
  .name;
