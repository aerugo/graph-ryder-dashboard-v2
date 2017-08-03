const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './main.routes';

export class MainController {
  $http;
  socket;
  graph;
  settings;

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    this.settings = {demo: true};
  }

  /**** Init the view *****/
  $onInit() {
    this.refresh();
  }

  /**** Refresh the sigma view ****/
  refresh() {
    this.$http.get('/api/tulip/getGraph/random').then(response => {
      this.graph = response.data;
    });
  }
}

export default angular.module('graphRyderDashboardApp.main', [
  uiRouter])
    .config(routing)
    .component('main', {
      template: require('./main.html'),
      controller: MainController,
      controllerAs: 'ctrl'
    })
    .name;
