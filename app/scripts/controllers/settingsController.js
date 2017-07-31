/**
 * Created by nferon on 01/07/16.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('SettingsCtrl', function ($scope, $rootScope, $resource, config, $q, $compile) {

        $scope.warning = {color: 'orange'};
        $scope.danger = {color: 'red'};
        $scope.success = {color: '#39b500'};
        $scope.infoPanelParent = "infoPanelParent";
        $rootScope.resetSuggestions(false, false, false, false);

        /***** Load api infos *****/
        $scope.refresh = function () {

            $scope.api = {"url": config.apiUrl, "status": "unknown", "version": "unknown"};
            $scope.style = {"status": $scope.warning, "version": $scope.warning, "ram": $scope.warning, "disk": $scope.warning};

            var Info = $resource(config.apiUrl + 'info');
            var info = Info.get();
            info.$promise.then(function (result) {
                // status
                $scope.api.status = result.status;
                if ($scope.api.status) // color
                    $scope.style.status = $scope.success;
                // ram usage
                $scope.api.ramLoad = result.percentRamUsage;
                if ($scope.api.ramLoad < 50.00) // color
                    $scope.style.ram = $scope.success;
                else if ($scope.api.ramLoad < 80.00)
                    $scope.style.ram = $scope.warning;
                else
                    $scope.style.ram = $scope.danger;
                // Disk usage
                $scope.api.diskLoad = result.percentDiskUsage;
                if ($scope.api.diskLoad < 50.00) // color
                    $scope.style.disk = $scope.success;
                else if ($scope.api.diskLoad < 80.00)
                    $scope.style.disk = $scope.warning;
                else
                    $scope.style.disk = $scope.danger;
            });
        };

        $scope.refresh();
});
