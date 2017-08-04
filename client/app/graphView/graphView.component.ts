'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
const ngResource = require('angular-resource');

import routes from './graphView.routes';

export class GraphViewComponent {
  $http;
  $compile;
  $scope;
  graph;
  info;
  settings;
  psettings = [];

  /*@ngInject*/
  constructor($http, $scope, $compile) {
    this.$http = $http;
    this.$compile = $compile;  // todo clean this
    this.$scope = $scope;
    this.settings = { demo: true, info: 'Graph-Ryder 2.0'};
    this.psettings = [{
      style: {
        title: "Settings",
        display: true,
        icon: "cog",
        css: 'width: 550px; height: 150px;'
      },
      type: 'settings',
      url: "Person/Link/Person"
    }];
    $scope.$on('$destroy', function() {
     // todo: destroy sigma instances
    });
  }

  /**** Init the view ****/
  $onInit() {
    this.refresh();
    this.addPanel("psettings[0]", "refresh()");
  }

  /**** Refresh the view *****/
  refresh() {
    this.$http.get('/api/tulip/getGraph/', {params:{"url": this.psettings[0].url}}).then(response => {
      this.graph = response.data;
    });
  }

  /***** Add a panel *****/
  addPanel(settings, actionHandler) {
    let panel = document.createElement("panel");
    panel.setAttribute("settings", "ctrl." + settings);
    panel.setAttribute("action", "ctrl." + actionHandler);
    angular.element('#panel_container').append(panel);
    this.$compile(panel)(this.$scope);
  }

  /**** Event handler *****/
  eventHandler(e) {
    switch(e.type){
      case 'clickNode':
        let id = this.psettings.push({
          style: {
            title: "Details " + e.data.node.label,
            display: true,
            icon: "info",
            css: 'width: 350px; height: 550px; top: '+ (e.data.captor.clientY - 25) +'px; left : '+ (e.data.captor.clientX -25) +'px;'
          },
          type: 'details',
          id: e.data.node.neo4j_id
        });
        this.addPanel("psettings["+ id +"]", "none");
        break;
      default:
        console.log(e)
    }
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
