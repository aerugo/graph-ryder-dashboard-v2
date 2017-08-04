'use strict';
const angular = require('angular');
require('jquery');
require('jquery-ui-bundle');


export default angular.module('graphRyderDashboardApp.panel', [])
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
        let loaded = false;

        /***** Load properties *******/
        scope.load = function(){
          if(!loaded && scope.settings.id) {
            $http.get('/api/tulip/getGraph/', {params: {"url": scope.settings.url}}).then(response => {
              scope.graph = response.data;
            });
          }
          loaded = true;
        };

        /***** EventHandler *****/
        // todo remove this dirty double func pass
        scope.eventHandler = function(e) {
          scope.listener({e: e});
        };
      }
    };
  })
  .name;
