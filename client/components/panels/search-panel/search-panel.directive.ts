'use strict';
const angular = require('angular');

export default angular.module('graphRyderDashboardApp.searchPanel', [])
  .directive('searchPanel', function($http, $timeout) {
    return {
      template: require('./search-panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        settings: '=',
        handler: '&'
      },
      link: function(scope, element, attrs) {
        element.draggable({handle: '.panel-heading', containment: '#main-view', scroll: false, stack: '.panel',
          start: function() {
            if (element.css('z-index') > 100) {
              element.css('z-index', 10);
            }
          }});
        element.resizable({minHeight: 150, minWidth: 150});

        scope.placeholder = 'Search ...';
        scope.searchQuery = '';
        scope.searchParams = [];
        scope.parameters = {};
        scope.step = 0;

        scope.init = function () {
          scope.searchQuery = '';
          scope.parameters.all = [];
          scope.parameters.node = [];
          scope.parameters.link = [];
          scope.parameters.key = [];
          scope.parameters.property = [];
          scope.parameters.value = [];
          if (scope.lastRequest) {
            $http.get('/api/model/').then(labels => {
              angular.forEach(scope.lastRequest.split('/')  , function (e) {
                if (e) {
                  let color = '';
                  angular.forEach(labels.data, function (label) {
                    if (label.color && e.split(':')[e.split(':').length - 1].split('->')[0] === label.label) {
                      color = label.color;
                    }
                  });
                  let props = [];
                  let p = e.split('->');
                  p.shift();
                  angular.forEach(p, function (prop) {
                    props.push({key: prop.split('=')[0], value: prop.split('=')[1]});
                  });
                  let element = e.split('->')[0];
                  scope.searchParams.push({
                    key: element,
                    name: element,
                    label: element,
                    color: color,
                    property: props
                  });
                }
              });
              scope.lastRequest = false;
              scope.handler({ e: {
                type: 'searchQuery',
                element: scope.settings.element,
                search: scope.searchParams
              }});
            });
          }
          if (scope.step === 0) {
            $http.get('/api/model/').then(labels => {
              angular.forEach(labels.data  , function (label, key) {
                let k = '';
                angular.forEach(label.parents  , function (p) {
                  k += p + ':';
                });
                k += label.label;
                if (label.parents.indexOf('Entity') !== -1 ||  label.parents.indexOf('Attribute') !== -1) {
                  scope.parameters.node.push({ key: k, name: label.label, placeholder: label.label, color: label.color });
                  scope.parameters.all.push({ key: k, name: label.label, placeholder: label.label, color: label.color });
                } else if (label.parents.indexOf('Link') !== -1) {
                  scope.parameters.link.push({key: k, name: label.label, placeholder: label.label, color: label.color});
                  scope.parameters.all.push({key: k, name: label.label, placeholder: label.label, color: label.color});
                }
              });
              //scope.parameters.key.push({ key: 'AND', name: 'AND', placeholder: 'AND', color: 'rgb(127,183,51)' });
              scope.parameters.key.push({ key: 'OR', name: 'OR', placeholder: 'OR', color: 'rgb(127,183,51)' });
              scope.parameters.all.push({ key: 'OR', name: 'OR', placeholder: 'OR', color: 'rgb(127,183,51)' });
              //scope.parameters.key.push({ key: 'NOT', name: 'NOT', placeholder: 'NOT', color: 'rgb(127,183,51)' });
            });
          // } else if (scope.step === 1) {
            // if (!scope.searchParams[scope.target].property.length) {
            //   scope.step = 2;
            //   scope.init();
            //   scope.step = 2;
            // } else {
            //   scope.parameters.actual = scope.searchParams[scope.target].property;
              // scope.parameters.key.push({ key: 'AND', name: 'AND', placeholder: 'AND', color: 'rgb(127,183,51)' });
              // scope.parameters.key.push({ key: 'OR', name: 'OR', placeholder: 'OR', color: 'rgb(127,183,51)' });
              //scope.parameters.key.push({ key: 'NOT', name: 'NOT', placeholder: 'NOT', color: 'rgb(127,183,51)' });
            // }
          } else if (scope.step === 1 ||  scope.step === 2) {
            scope.step = 2;
            scope.parameters.actual = scope.searchParams[scope.target].property;
            console.log(scope.parameters.actual);
            $http.get('/api/data/getPropertiesByLabel/' + scope.label).then(properties => {
              angular.forEach(properties.data, function (property, key) {
                scope.parameters.all.push({key: property, name: property, placeholder: property, color: 'rgb(127,183,51)'});
                scope.parameters.property.push({key: property, name: property, placeholder: property, color: 'rgb(127,183,51)'});
              });
            });
          } else if (scope.step === 3) {
            $http.get('/api/data/getPropertyValue/' + scope.label + '/' + scope.prop).then(values => {
              angular.forEach(values.data, function (value, key) {
                scope.parameters.all.push({key: value, name: value, placeholder: value, color: 'rgb(127,183,51)'});
                scope.parameters.value.push({key: value, name: value, placeholder: value, color: 'rgb(127,183,51)'});
              });
            });
          }
          scope.step++;
        };
        scope.searchQueryTypeaheadOnSelect =  function (index) {
          if (scope.step === 1) {
            scope.searchParams.push({
              name: index.key,
              label: index.key,
              color: index.color,
              property: []
            });
            scope.step = 0;
            scope.label = index.key;
            scope.init();
          } else if (scope.step === 2) {
            scope.searchParams[scope.target].property.push({key: index.key, value: ''});
            scope.init();
          } else if (scope.step === 3) {
            scope.prop = index.key;
            scope.init();
          } else if (scope.step === 4) {
            scope.searchParams[scope.target].property.push({key: scope.prop, value: index.key};
            scope.prop = '';
            scope.step = 1;
            scope.init();
          }
        };

        scope.filter = function (index, label) {
          if (scope.step === 1 ||  scope.target !== index) {
            scope.target = index;
            scope.label = label;
            scope.step = 1;
          }
          if (scope.step === 1) {
            scope.target = index;
            scope.label = label;
          } else {
            scope.step = 0;
            scope.parameters = [];
          }
          scope.init();
        };

        scope.removeSearchParam = function (index) {
          scope.searchParams.splice(index, 1);
          scope.step = 0;
          scope.parameters = [];
          scope.searchQuery = '';
          scope.init();
        };

        scope.removeProp = function (index) {
          scope.searchParams[scope.target].property.splice(index, 1);
        };

        scope.removeAll = function () {
          scope.searchParams = [];
          scope.step = 0;
          scope.parameters = [];
          scope.searchQuery = '';
          scope.init();
        };

        scope.action = function () {
          scope.handler({ e: {
              type: 'searchQuery',
              element: scope.settings.element,
              search: scope.searchParams,
              directed: scope.directed
            }});
        };

        scope.detach = function () {
          scope.handler({ e: {
              type: 'searchQueryDetach',
              element: scope.settings.element,
              search: scope.searchParams,
              directed: scope.directed
            }});
        };

        scope.focus = function(){
          angular.element('#searchBox').focus();
        };

        $timeout(function () {
          scope.lastRequest = scope.settings.user().lastRequest;
          scope.init();
        });
      }
    };
  })
  .name;
