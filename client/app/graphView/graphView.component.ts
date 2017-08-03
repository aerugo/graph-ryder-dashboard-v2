'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
const ngResource = require('angular-resource');

import routes from './graphView.routes';

export class GraphViewComponent {
  $http;
  graph;
  info;
  settings;
  psettings;

  /*@ngInject*/
  constructor($http, $scope) {
    this.info = 'Graph-Ryder 2.0';
    this.$http = $http;
    this.settings = { demo: true};
    this.psettings = {
      style: {
        title: "Settings",
        display: true,
        reduce: false,
        icon: "cog",
        width: "450px",
        height: "150px"
      },
      url: "Person/Link/Person"
    };
    $scope.$on('$destroy', function() {
     // todo: destroy sigma instances
    });
  }

  $onInit() {
    this.replay();
  }

  replay() {
    this.$http.get('/api/tulip/getGraph/', {params:{"url": this.psettings.url}}).then(response => {
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
