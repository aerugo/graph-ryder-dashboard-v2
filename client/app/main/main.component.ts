const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './main.routes';

export class MainController {
  $http;
  socket;
  awesomeThings = [];
  newThing = '';
  graph;
  settings;

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    this.settings = {demo: true};

    $scope.$on('$destroy', function() {
    });
  }

  $onInit() {
    this.$http.get('/api/tulip/getGraph/random').then(response => {
      this.graph = response.data;
    });
  }
  replay() {
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
