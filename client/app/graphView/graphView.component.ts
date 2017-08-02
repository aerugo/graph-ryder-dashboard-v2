'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
const ngResource = require('angular-resource');

import routes from './graphView.routes';

export class GraphViewComponent {
  $http;
  graph;
  eventCatcher;
  info;
  settings;

  /*@ngInject*/
  constructor($http, $scope) {
    this.info = 'Graph-Ryder 2.0';
    this.$http = $http;
    this.settings = { demo: true};
    $scope.$on('$destroy', function() {
     // todo: destroy sigma instances
    });
  }

  $onInit() {
    this.$http.get('/api/tulip/getGraph/random').then(response => {
      this.graph = response.data;
    });
  }
}

export default angular.module('graphRyderDashboardApp.graphView', [uiRouter])
  .config(routes)
  .component('graphView', {
    template: require('./graphView.html'),
    controller: GraphViewComponent,
    controllerAs: 'ctrl'
  })
  .name;
