'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './model.routes';

export class ModelComponent {
  $http;
  $scope;

  /*@ngInject*/
  constructor($http, $scope) {
    this.$http = $http;
    this.$scope = $scope;

    // todo redo in a cleaner way
    let labelsCount = {};
    let countLabel =  function(label){
      $http.get('/api/data/countLabel/'+label).then(response => {
        labelsCount[label] = response.data;
      });
    };
    $http.get('/api/data/getLabelsHierarchy/').then(response => {
      $scope.keys = Object.keys(response.data);
      let keys2 = {};
      let keys3 = {};
      angular.forEach(response.data, function(label, key){
         countLabel(key);
        keys2[key] = [];
        angular.forEach(label, function(l){
          angular.forEach(Object.keys(l), function(k){
            countLabel(k);
            keys3[k] = [];
            angular.forEach(l[k], function(l3){
              angular.forEach(Object.keys(l3), function(k3){
                countLabel(k3);
                keys3[k].push(k3);
              });
            });
            keys2[key].push(k);
          });
        });
      });
      $scope.keys2 = keys2;
      $scope.keys3 = keys3;
      $scope.labelsCount = labelsCount;
    });
  }
}

export default angular.module('graphRyderDashboardApp.model', [uiRouter])
  .config(routes)
  .component('model', {
    template: require('./model.html'),
    controller: ModelComponent,
    controllerAs: 'modelCtrl'
  })
  .name;
