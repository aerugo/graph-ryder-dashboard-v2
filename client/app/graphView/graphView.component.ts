'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './graphView.routes';

export class GraphViewComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('graphRyderDashboardApp.graphView', [uiRouter])
  .config(routes)
  .component('graphView', {
    template: require('./graphView.html'),
    controller: GraphViewComponent,
    controllerAs: 'graphViewCtrl'
  })
  .name;
