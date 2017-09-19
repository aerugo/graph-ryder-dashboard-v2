const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './main.routes';

export class MainController {
  $http;
  socket;
  sigma;

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    this.sigma = {
      graph: {
        action: '',
        selection: []
      },
      settings: {
        demo: true,
        element: 0,
        active: true
      }
    };
  }

  /**** Init the view *****/
  $onInit() {
    this.refresh();
  }

  /**** Refresh the sigma view ****/
  refresh() {
    this.$http.get('/api/tulip/getGraph/random').then(response => {
      this.sigma.graph = response.data;
      this.sigma.graph.action = '';
      this.sigma.graph.selection = [];
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
