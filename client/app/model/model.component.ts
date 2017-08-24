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
    let property = {};
    let newLabels = [];
    let hierarchy = [];
    let http = this.$http;
    let scope = this.$scope;
    http.get('/api/data/countLabels/').then(response => {
      scope.labelsCount = response.data;
    });
    let getProperty = function (label) {
      http.get('/api/data/getProperties/' + label).then(response => {
        property[label] = response.data;
      });
    };
    let analyse = function(key, labels, model){
      /*** Exit ****/
      if(!Object.keys(labels).length) {
        getProperty(key);
        let element = {label: key};
        let find = false;
        angular.forEach(model, function (e) {
          if (e.label == key) {
            element['labeling'] = e.labeling;
            element['color'] = e.color;
            find = true;
          }
        });
        if (!find) {
          element['labeling'] = 'name';
          element['color'] = 'rgb(51,122,183)';
          newLabels.push(key);
        }
        return element;
      }
      /**** Ungroupable case *****/
      else if (key.substring(0,11) === 'ungroupable') {
        let result = [];
        let found = false;
        angular.forEach(labels, function (label, k) {
          angular.forEach(model, function (e) {
            if (e.label == k && e.children.length) {
              found = k;
            }
          });
        });
        if (found) {
          angular.forEach(labels, function (l, k) {
            if (k !== found) {
              result.push(analyse(k, l, model));
            }
          });
          return {label: found, children: result};
        }
        else {
          angular.forEach(labels, function (label, key) {
            result.push(analyse(key, label, model));
          });
          return {label: key, children: result};
        }
      }
      /***** Continue *****/
      else {
        let result = [];
        angular.forEach(labels, function (label, key) {
          result.push(analyse(key, label, model));
        });
        return {label: key, children: result};
      }
    };

    http.get('/api/data/getLabelsHierarchy/').then(response => {
      http.get('/api/model/').then(model => {
        console.log(model.data);
        angular.forEach(response.data, function (label, key) {
          hierarchy.push(analyse(key, label, model.data));
        });
      });
    });
    scope.hierarchy = hierarchy;
    scope.property = property;
    scope.newLabels = newLabels;
  }
  update() {
    let http = this.$http;
    let that = this;
    let promises = [];
    let updateChildren = function(e) {
      if (!e.children) {
        promises.push(http.post('/api/model', e));
      }
      else {
        angular.forEach(e.children, function(child) {
          updateChildren(child);
        });
      }
    };
    let updateParents = function(e) {
      if (!e.children) {
        return [e.label];
      }
      else {
        let element = {label: e.label, children: []};
        angular.forEach(e.children, function(child) {
          element.children = element.children.concat(updateParents(child));
        });
        promises.push(http.post('/api/model', element));
        return element.children;
      }
    };
    promises.push(http.delete('/api/model/all/').then(response => {
      angular.forEach(this.$scope.hierarchy, function(key){
        updateChildren(key);
      });
      angular.forEach(this.$scope.hierarchy, function(key){
        updateParents(key);
      });
    }));
    Promise.all(promises).then(function() {
      that.init();
    });
  }

  updateUngroupable = function() {
    angular.forEach(this.$scope.hierarchy, function(key){
      if (key.label.substring(0,11) === 'ungroupable' && key.choice) {
        key.label = key.choice.label;
        key.children.splice(key.children.indexOf(key.choice),1);
      }
    });
  };

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
