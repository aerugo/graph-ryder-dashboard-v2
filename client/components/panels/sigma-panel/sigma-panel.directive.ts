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
        element.draggable({handle: ".panel-heading", containment: "body", scroll: false });
        element.resizable({minHeight: 150, minWidth:150}); // todo refresh on resize

        /***** Load properties *******/
        scope.draw = function() {
          if(scope.settings.id) {
            $http.get('/api/tulip/getGraph/', {params: {"url": scope.settings.url}}).then(response => {
              scope.graph = response.data;
            });
          }
        };
        scope.draw();

        scope.eventHandler = function(e) {
          /***** EventHandler *****/
        // todo remove this dirty double func pass
          scope.listener({e: e});
        };
      }
    };
  })
  .name;
