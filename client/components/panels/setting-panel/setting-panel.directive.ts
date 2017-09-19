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
        let u = {type: '', leftLabel: '', edgeLabel: '', rightLabel: '', nodeId: '', layout: '', query: ''};
        u = Object.assign({}, scope.settings.sigma.url);

        /***** Action *****/
        scope.action = function() {
          u = Object.assign({}, scope.settings.sigma.url);
          let params = {
            url: '',
            layout: '',
            query: ''
          };
          switch (u.type) {
            case 'getGraph':
              params.url = u.type + '/' +  u.leftLabel + '/' + u.edgeLabel + '/' + u.rightLabel;
              break;
            case 'getGraphNeighboursById':
              params.url = u.type + '/' +  u.nodeId + '/' + u.edgeLabel + '/' + u.rightLabel;
              break;
            case 'getQueryGraph':
              params.url = u.type;
              angular.forEach(u.query, function (q, index) {
                params.query += q.name + '/';
              });
              break;
          }
          params.layout = u.layout;
          $http.get('/api/tulip/' + u.type, {params: params}).then(response => {
            scope.settings.sigma.graph = response.data;
            scope.settings.sigma.graph.action = '';
            scope.settings.sigma.graph.selection = [];
            scope.settings.sigma.url.done = true;
          });
        };

        scope.actionDetach = function () {
          let e = {type: 'detach', url: Object.assign({}, scope.settings.sigma.url)};
          scope.settings.sigma.url = Object.assign({}, u);
          scope.handler({e: e});
        };

        /***** Get labels *****/
        $http.get('/api/model/').then(model => {
          scope.labels = model.data;
        });

        scope.$watch('settings.sigma.url.done', function(newVal) {
          if (!newVal) {
            scope.action();
          }
        });

        /**** Init ****/
        $timeout(function () {
          scope.action();
        });
      }
    };
  })
  .name;
