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
    this.init();
  }

  init() {
    // todo redo in a cleaner way
    let labelsCount = {};
    let property = {};
    let http = this.$http;
    let scope = this.$scope;
    let countLabel = function (label) {
      http.get('/api/data/countLabel/' + label).then(response => {
        labelsCount[label] = response.data;
      });
    };
    let getProperty = function (label) {
      http.get('/api/data/getProperties/' + label).then(response => {
        property[label] = response.data;
      });
    };
    let getObject = function (label, model, coloration) {
      let find = {};
      if (!coloration) {
        return {label: label};
      } else {
        angular.forEach(model, function (object) {
          if (object.label == label) {
            find = {label: object.label, color: object.color, labeling: object.labeling};
          }
        });
        if (Object.keys(find).length) {
          return find;
        } else {
          return {label: label, color: 'rgb(51,122,183)', labeling: 'name'};
        }
      }
    };
    http.get('/api/data/getLabelsHierarchy/').then(response => {
      http.get('/api/model/').then(model => {
        scope.keys = [];
        let keys2 = {};
        let keys3 = {};
        angular.forEach(response.data, function (label, key) {
          getProperty(key);
          scope.keys.push(getObject(key, model.data, !label.length));
          countLabel(key);
          keys2[key] = [];
          angular.forEach(label, function (l) {
            angular.forEach(Object.keys(l), function (k) {
              countLabel(k);
              keys3[k] = [];
              if (l[k].length) {
                keys2[key].push(getObject(k, model.data, false));
              } else {
                getProperty(k);
                keys2[key].push(getObject(k, model.data, true));
              }
              angular.forEach(l[k], function (l3) {
                angular.forEach(Object.keys(l3), function (k3) {
                  countLabel(k3);
                  keys3[k].push(getObject(k3, model.data, true));
                  getProperty(k3);
                });
              });
            });
          });
        });
        scope.keys2 = keys2;
        scope.keys3 = keys3;
        scope.labelsCount = labelsCount;
        scope.property = property;
      });
    });
  }
  update() {
    let http = this.$http;
    http.delete('/api/model/all/').then(response => {
      angular.forEach(this.$scope.keys, function(key){
        http.post('/api/model', key);
      });
      angular.forEach(this.$scope.keys2, function(label){
        angular.forEach(label, function(key){
          http.post('/api/model', key);
        });
      });
      angular.forEach(this.$scope.keys3, function(label){
        angular.forEach(label, function(key){
          http.post('/api/model', key);
        });
      });
    });
  }

  reset() {
    let http = this.$http;
    http.delete('/api/model/all/').then(response => {
      this.init();
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
