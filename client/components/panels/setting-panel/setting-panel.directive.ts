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
        settings: '='
      },
      link: function(scope, element) {
        element.draggable({handle: '.panel-heading', containment: 'body', scroll: false, stack: '.panel',
          start: function() {
            if (element.css('z-index') > 100) {
              element.css('z-index', 10);
            }
          }});
        element.resizable({minHeight: 150, minWidth: 150}); // todo refresh on resize

        scope.action = function() {
          let u = scope.settings.sigma.url;
          let params = {};
          switch(u.type) {
            case 'getGraph':
              params['url'] = u.type + '/' +  u.leftLabel + '/' + u.edgeLabel + '/' + u.rightLabel;
              break;
            case 'getGraphNeighboursById':
              params['url'] = u.type + '/' +  u.nodeId + '/' + u.edgeLabel + '/' + u.rightLabel;
              break;
          }
          params['layout'] = u.layout;
          let promises = [];
          promises.push($http.get('/api/model/label/' + u.leftLabel).then(left_label => {
            params['label_key_left'] = left_label.data.labeling;
            params['color_left'] = left_label.data.color;
            if (u.leftLabel === u.rightLabel) {
              params['label_key_right'] = left_label.data.labeling;
              params['color_right'] = left_label.data.color;
            }
          }));
          if (u.leftLabel !== u.rightLabel) {
            promises.push($http.get('/api/model/label/' + u.rightLabel).then(right_label => {
              params['label_key_right'] = right_label.data.labeling;
              params['color_right'] = right_label.data.color;
            }));
          }
          promises.push($http.get('/api/model/label/' + u.edgeLabel).then(edge_label => {
            params['color_edge'] = edge_label.data.color;
          }));
          Promise.all(promises).then(function() {
            $http.get('/api/tulip/' + u.type, {params: params}).then(response => {
              scope.settings.sigma.graph = response.data;
            });
          });
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
