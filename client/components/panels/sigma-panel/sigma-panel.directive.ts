'use strict';
const angular = require('angular');

import 'bootstrap';
import 'jquery';
import 'jquery-ui-bundle';


export default angular.module('graphRyderDashboardApp.sigmaPanel', [])
  .directive('sigmaPanel', function($http) {
    return {
      template: require('./sigma-panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        settings: '=',
        listener: '&'
      },
      link: function(scope, element) {
        element.draggable({handle: '.panel-heading', containment: 'body', scroll: false, stack: '.panel'});
        element.resizable({minHeight: 150, minWidth: 150}); // todo refresh on resize

        /***** Load properties *******/
        scope.action = function() {
          console.log(scope.settings);
          let u = scope.settings.url;
          let params = {'url': u.type + '/' + u.nodeId + '/' + u.edgeLabel + '/' + u.rightLabel};
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
                  scope.settings.graph = response.data;
                });
              });
            });
          });
        };
        scope.action();

        scope.eventHandler = function(e) {
          /***** EventHandler *****/
        // todo remove this dirty double func pass
          scope.listener({e: e});
        };
      }
    };
  })
  .name;
