'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('MainCtrl', function($scope, $resource, config, $rootScope, $q) {

    $rootScope.ready = false;

    /***** Load layout algorithm *******/
    var Layout = $resource(config.apiUrl + 'layoutAlgorithm');
    var layout = Layout.query();
    layout.$promise.then(function (result) {
      var layout = [];
      var layoutName = "";
      angular.forEach(result, function (value) {
        layoutName = "";
        angular.forEach(value, function (value2) {
          layoutName += value2;
        });
        layout.push(layoutName)
      });
      $rootScope.layout = layout;
      $rootScope.ready = true;
    });

    /***** Load all data *****/
    $rootScope.suggestions = [];

    $rootScope.resetSuggestions = function (users, posts, comments, tags) {
    };

    //$rootScope.resetSuggestions(true, true, true, true);

  });
