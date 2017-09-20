'use strict';
const angular = require('angular');

import 'bootstrap';
import 'jquery';
import 'jquery-ui-bundle';


export default angular.module('graphRyderDashboardApp.sigmaPanel', [])
  .directive('sigmaPanel', function($http, $compile, $timeout) {
    return {
      template: require('./sigma-panel.html'),
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
        element.resizable({minHeight: 150, minWidth: 150}); // todo refresh on resize

        /***** Load properties *******/
        scope.settingsPanel = {
          sigma: scope.settings,
          style: scope.settings.settingsPanelStyle
        };

        scope.action = function() {
          let panel = document.createElement('setting-panel');
          panel.setAttribute('settings', 'settingsPanel');
          panel.setAttribute('handler', 'eventHandler(e)');
          angular.element('#' + scope.settings.element).append(panel);
          $compile(panel)(scope);
        };

        scope.eventHandler = function(e) {
          e.element = scope.settings.element;
          scope.handler({e: e});
        };

        scope.$watch('settings.sigma.url.layout', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            scope.action();
          }
        });
        if (scope.settings.settingsPanelStyle) {
          scope.$watch('settings.settingsPanelStyle', function (newVal) {
            if (newVal) {
              scope.settingsPanel.style.display = true;
            }
          });
        }
        $timeout(function () {
          scope.action();
        });
      }
    };
  })
  .name;
