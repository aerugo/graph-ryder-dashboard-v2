/**
 * Created by nferon on 17/06/16.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:GlobalCtrl
 * @description
 * # GlobalCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('GlobalCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q, $location, $timeout, $compile) {

        /**** Init ****/
        //edge label default
        $scope.globalel = false;
        $scope.locate = "";
        $scope.infoPanelParent = "infoPanelParent";

        // When rootScope is ready load the graph
        $rootScope.$watch('ready', function(newVal) {
            if(newVal) {
                $scope.layoutChoice = $rootScope.layout[12];
                $scope.drawGraph();
                $rootScope.resetSuggestions(true, true, true, true);
            }
        });

        /***** Global view *****/
        $scope.globalGraphSigma = [];

        $scope.drawGraph = function () {
            // // Read the complete graph from api
            var drawGraph = $resource(config.apiUrl + 'getGraph/random/?layout=' + $scope.layoutChoice);
            $scope.drawGraphPromise = drawGraph.get();
            $scope.drawGraphPromise.$promise.then(function (result) {
                $scope.globalGraphSigma = result;
            });
        };

        /*** Sigma Event Catcher ***/
        $scope.eventCatcher = function (e) {
            switch(e.type) {
                case 'clickNode':
                    //$scope.openInfoPanel($scope.elementId);
                    break;
            }
        };

        /********* Info Panel ***************/
        $scope.openInfoPanel = function(elementId) {
            if (elementId < 0) {
                return;
            }
            var mod = document.createElement("panel-info");
            mod.setAttribute("id", elementId);
            jQuery("#"+ $scope.infoPanelParent).append(mod);
            $compile(mod)($scope);
        };

        /********* Modal  ***************/
        $scope.openModal = function (type, id) {
            $scope.elementType = type;
            $scope.elementId = id;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/ui-elements/modal-view.html',
                controller: 'ModalInstanceCtrl',
                buttons: {
                    Cancel: function () {
                        $("#modal_dialog").dialog("close");
                    }
                },
                resolve: {
                    scopeParent: function() {
                        return $scope; //On passe à la fenêtre modal une référence vers le scope parent.
                    }
                }
            });

            // Catch return, reopen a new modal ?
            modalInstance.result.then(function (res) {
                if(res != undefined) {
                    res = res.split(':');
                    $scope.openModal(res[0], res[1]);
                }
            });
        };

        /*** Search Bar Catcher *****/
        $rootScope.$watch('search', function(newVal) {
            // $scope.openInfoPanel();
        });
        $scope.$on("$destroy", function(){
            //todo stop all active request
            // remove watchers in rootScope
            angular.forEach($rootScope.$$watchers, function(watcher, key) {
                if(watcher.exp === 'search' || watcher.exp === 'ready') {
                    $rootScope.$$watchers.splice(key, 1);
                }
            });
        });
    });
