'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './model.routes';

export class ModelComponent {
  $http;
  $scope;
  property;

  /*@ngInject*/
  constructor($http, $scope) { // todo allow creation of new label
    this.$http = $http;
    this.$scope = $scope;
    this.init();
  }

  init() {
    this.property = {};
    let newLabels = [];
    let hierarchy = [];
    let http = this.$http;
    let scope = this.$scope;
    http.get('/api/data/countLabels/').then(response => {
      scope.labelsCount = response.data;
    });
    let getProperty = function (label, property) {
      http.get('/api/data/getProperties/' + label).then(response => {
        property[label] = response.data;
      });
    };
    let analyse = function(parents, key, labels, model, property){
      /*** Exit ****/
      if (!Object.keys(labels).length) {
        getProperty(key, property);
        let element = {label: key, labeling: '', color: '', parents: []};
        angular.forEach(parents, function (p) {
          element.parents.push(p);
        });
        let find = false;
        angular.forEach(model, function (e) {
          if (e.label === key) {
            element.labeling = e.labeling;
            element.color = e.color;
            find = true;
          }
        });
        if (!find) {
          element.color = 'rgb(51,122,183)';
          newLabels.push(key);
        }
        return element;
        /**** Ungroupable case *****/
      } else if (key.substring(0, 11) === 'ungroupable') {
        let result = [];
        let found = false;
        angular.forEach(labels, function (label, k1) {
          angular.forEach(model, function (e) {
            if (e.label === k1 && e.children.length) {
              found = k1;
            }
          });
        });
        if (found) {
          angular.forEach(labels, function (l, k) {
            if (k !== found) {
              parents.indexOf(key) === -1 ? parents.push(found) : null;
              result.push(analyse(parents, k, l, model, property));
            }
          });
          return {label: found, children: result};
        } else {
          angular.forEach(labels, function (label, k) {
            parents.indexOf(key) === -1 ? parents.push(key) : null;
            result.push(analyse(parents, k, label, model, property));
          });
          return {label: key, children: result};
        }
      } else {
        /***** Continue *****/
        let result = [];
        angular.forEach(labels, function (label, k) {
          parents.indexOf(key) === -1 ? parents.push(key) : null;
          result.push(analyse(parents, k, label, model, property));
        });
        return {label: key, children: result};
      }
    };
    let property = this.property;
    http.get('/api/data/getLabelsHierarchy/').then(response => {
      http.get('/api/model/').then(model => {
        angular.forEach(response.data, function (label, key) {
          hierarchy.push(analyse([], key, label, model.data, property));
        });
      });
    });
    scope.hierarchy = hierarchy;
    scope.property = this.property;
    scope.newLabels = newLabels;
  }
  update() {
    let http = this.$http;
    let that = this;
    let promises = [];
    let updateChildren = function(e, property) {
      if (!e.children) {
        e.prop = property[e.label];
        e.prop.sort();
        promises.push(http.post('/api/model', e));
      } else {
        angular.forEach(e.children, function(child) {
          updateChildren(child, property);
        });
      }
    };
    let updateParents = function(e) {
      if (!e.children) {
        return [e.label];
      } else {
        let element = {label: e.label, children: []};
        angular.forEach(e.children, function(child) {
          element.children = element.children.concat(updateParents(child));
        });
        promises.push(http.post('/api/model', element));
        return element.children;
      }
    };
    let property = this.property;
    promises.push(http.delete('/api/model/all/').then(response => {
      angular.forEach(this.$scope.hierarchy, function(key){
        updateChildren(key, property);
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
      if (key.label.substring(0, 11) === 'ungroupable' && key.choice) {
        key.label = key.choice.label;
        key.children.splice(key.children.indexOf(key.choice), 1);
        angular.forEach(key.children, function (children) {
          children.parents = [key.choice.label];
        });
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
