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
        let u = {type: '', leftLabel: '', edgeLabel: '', rightLabel: '', nodeId: '', layout: ''};
        u = Object.assign({}, scope.settings.sigma.url);

        /***** Action *****/
        scope.action = function() {
          u = Object.assign({}, scope.settings.sigma.url);
          let params = {
            url: '',
            layout: ''
          };
          switch (u.type) {
            case 'getGraph':
              params.url = u.type + '/' +  u.leftLabel + '/' + u.edgeLabel + '/' + u.rightLabel;
              break;
            case 'getGraphNeighboursById':
              params.url = u.type + '/' +  u.nodeId + '/' + u.edgeLabel + '/' + u.rightLabel;
              break;
          }
          params.layout = u.layout;
          $http.get('/api/tulip/' + u.type, {params: params}).then(response => {
            scope.settings.sigma.graph = response.data;
            scope.settings.sigma.graph.action = '';
            scope.settings.sigma.graph.selection = [];
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

        scope.$watch('settings.sigma.url.layout', function(newVal, oldVal) {
          if (newVal !== oldVal) {
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
