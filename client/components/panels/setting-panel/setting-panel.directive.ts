'use strict';
const angular = require('angular');

import 'bootstrap';
import 'jquery';
import 'jquery-ui-bundle';


export default angular.module('graphRyderDashboardApp.settingPanel', [])
  .directive('settingPanel', function($http, $timeout) {
    return {
      template: require('./setting-panel.html'),
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
        element.resizable({minHeight: 125, minWidth: 150});
        let u = {type: '', leftLabel: '', edgeLabel: '', rightLabel: '', nodeId: '', layout: '', query: '', directed: ''};
        u = Object.assign({}, scope.settings.sigma.url);

        /***** Action *****/
        scope.action = function() {
          u = Object.assign({}, scope.settings.sigma.url);
          let params = {
            url: '',
            layout: '',
            query: ''
          };
          let ready = false;
          switch (u.type) {
            case 'getGraphNeighboursById':
              params.url = u.type + '/' +  u.nodeId + '/' + u.edgeLabel + '/' + u.rightLabel;
              if (u.nodeId && u.edgeLabel && u.rightLabel) {
                ready = true;
              }
              break;
            case 'getQueryGraph':
              params.url = u.type;
              angular.forEach(u.query, function (e, index) {
                params.query += e.label;
                angular.forEach(e.property, function (prop, i) {
                  params.query += '->' + prop.key + '=' + prop.value;
                };
                params.query += '/';
              });
              ready = true;
              break;
          }
          params.layout = u.layout;
          if (ready) {
            scope.handler({e: {type: 'info', label: 'Info',  labeling: '', text: 'Loading...', color: 'rgb(240, 173, 78)'}});
            $http.get('/api/tulip/' + u.type, {params: params}).then(response => {
              if (response.data === 'error') {
                scope.handler({e: {type: 'info', label: 'Error', labeling: '', text: 'Check request syntax please.', color: 'red'}});
                scope.settings.sigma.graph = [];
              } else {
                scope.settings.sigma.graph = response.data;
                scope.handler({e: {type: 'info', label: 'Info',  labeling: '', text: 'Request done !', color: 'rgb(92, 184, 92)'}});
                if (response.data.nodes.length && u.type === 'getQueryGraph' && scope.settings.sigma.sigmaSettings.element === 0) {
                  scope.handler({e: {type: 'lastRequest', request: params.query}}); // todo correct last request
                } else {
                  scope.handler({e: {type: 'info', label: 'Info',  labeling: '', text: 'Request result is empty.', color: 'red'}});
                }
              }
              scope.settings.sigma.graph.action = '';
              scope.settings.sigma.graph.selection = [];
              scope.settings.sigma.url.done = true;
            });
          }
        };

        scope.actionDetach = function () {
          let e = {type: 'detach', url: Object.assign({}, scope.settings.sigma.url)};
          scope.settings.sigma.url = Object.assign({}, u);
          scope.handler({e: e});
        };

        /***** Get labels *****/
        $http.get('/api/model/').then(model => {
          scope.nodeLabels = [];
          scope.edgeLabels = [];
          scope.labels = model.data;
          angular.forEach(model.data, function(label) {
            if (label.parents.indexOf('Node') !== -1) {
              scope.nodeLabels.push(label);
            } else if (label.parents.indexOf('Link') !== -1) {
              scope.edgeLabels.push(label);
            }
          });
        });

        scope.$watch('settings.sigma.url.done', function(newVal) {
          if (newVal === false) {
            scope.action();
          }
        });
      }
    };
  })
  .name;
