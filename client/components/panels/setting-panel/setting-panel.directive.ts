'use strict';
const angular = require('angular');

import 'bootstrap';
import 'jquery';
import 'jquery-ui-bundle';


export default angular.module('graphRyderDashboardApp.settingPanel', [])
  .directive('settingPanel', function($http) {
    return {
      template: require('./setting-panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        settings: '='
      },
      link: function(scope, element) {
        element.draggable({handle: '.panel-heading', containment: 'body', scroll: false, stack: '.panel'});
        element.resizable({minHeight: 150, minWidth: 150}); // todo refresh on resize

        scope.action = function() {
          let u = scope.settings.sigma.url;
          let params = {'url': u.type + '/' +  u.leftLabel + '/' + u.edgeLabel + '/' + u.rightLabel};
          params['layout'] = u.layout;
          // todo pack promise
          $http.get('/api/model/label/' + u.leftLabel).then(left_label => {
            params['label_key_left'] = left_label.data.labeling;
            params['color_left'] = left_label.data.color;
            $http.get('/api/model/label/' + u.rightLabel).then(right_label => {
              params['label_key_right'] = right_label.data.labeling;
              params['color_right'] = right_label.data.color;
              $http.get('/api/model/label/' + u.edgeLabel).then(edge_label => {
                params['color_edge'] = edge_label.data.color;
                $http.get('/api/tulip/', {params: params}).then(response => {
                  scope.settings.sigma.graph = response.data;
                });
              });
            });
          });
          /***** Get labels *****/
          $http.get('/api/model/').then(model => {
            scope.labels = model.data;
          });
        };
        scope.$watch('settings.sigma.url.layout', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            scope.action();
          }
        });
        scope.action();
      }
    };
  })
  .name;
