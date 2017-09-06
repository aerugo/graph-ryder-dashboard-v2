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
            label_key_left: '',
            label_key_right: '',
            color_left: '',
            color_right: '',
            layout: '',
            label_key_edge: '',
            color_edge: ''
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
          let promises = [];
          promises.push($http.get('/api/model/label/' + u.leftLabel).then(left_label => {
            params.label_key_left = left_label.data.labeling;
            params.color_left = left_label.data.color;
            if (u.leftLabel === u.rightLabel) {
              params.label_key_right = left_label.data.labeling;
              params.color_right = left_label.data.color;
            }
          }));
          if (u.leftLabel !== u.rightLabel) {
            promises.push($http.get('/api/model/label/' + u.rightLabel).then(right_label => {
              params.label_key_right = right_label.data.labeling;
              params.color_right = right_label.data.color;
            }));
          }
          promises.push($http.get('/api/model/label/' + u.edgeLabel).then(edge_label => {
            params.label_key_edge = edge_label.data.labeling;
            params.color_edge = edge_label.data.color;
          }));
          Promise.all(promises).then(function() {
            $http.get('/api/tulip/' + u.type, {params: params}).then(response => {
              scope.settings.sigma.graph = response.data;
              scope.settings.sigma.graph.action = '';
              scope.settings.sigma.graph.selection = [];
            });
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
