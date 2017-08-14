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
        element.draggable({handle: ".panel-heading", containment: "body", scroll: false });
        element.resizable({minHeight: 150, minWidth:150}); // todo refresh on resize
        let loaded = false;
        scope.test= "hello";

        scope.action = function() {
          $http.get('/api/tulip/', {params: {"url": scope.settings.sigma.url}}).then(response => {
            scope.settings.sigma.graph = response.data;
          });

          /***** Get labels *****/
          $http.get('/api/data/getLabels/').then(response => {
            scope.labels = response.data;
          });
        };
        scope.action();

        /***** Load properties *******/
        scope.load = function(){
          if(!loaded) {

          }
          loaded = true;
        };
      }
    };
  })
  .name;
