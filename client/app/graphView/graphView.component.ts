'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
const ngResource = require('angular-resource');

import routes from './graphView.routes';

export class GraphViewComponent {
  $http;
  graph;

  /*@ngInject*/
  constructor($http, $scope) {
     this.$http = $http;
     $scope.$on('$destroy', function() {
       // todo: destroy sigma instances
     });
  }

  $onInit() {
    this.$http.get('http://localhost:5000/getGraph/random').then(response => {
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
