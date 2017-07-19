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
    .controller('TagViewFullCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q, $location, $timeout, $compile) {

        /**** Init ****/
        //edge label default
        $scope.sigma_instance;
        $scope.tagel = false;
        $scope.tagnl = false;
        $scope.nodelabelthreshold = 10;
        $scope.locate = "";
        $scope.clean_refresh_sigma_decorator = 0;
        $scope.requestFullTagGraph = false;
        $scope.filter_occurrence_min = "2";
        $scope.filter_occurrence_max = "100";
        $scope.filter_occurrence_request = "2";
        $scope.sigma_instance = undefined;
        $scope.interactor = "navigate";
        $scope.showTagCommonContent = false;
        $scope.tag_src = {id: -1, label:""};
        $scope.tag_dst = {id: -1, label:""};
        $scope.infoPanelParent = "infoPanelParent";
        $("#download_link_dialog").dialog({ autoOpen: false });
        // When rootScope is ready load the graph
        $rootScope.$watch('ready', function(newVal) {
            if(newVal) {
                $scope.layoutChoice = $rootScope.layout[12];
                //$scope.tableSizeChoice = 10;
                $scope.selected.start= new Date(0);
                $scope.selected.end= new Date(Date.now());
                $scope.generateGraph();
                $rootScope.resetSuggestions(false, false, false, true);
                //load tags then create the graph
                /*var Tags = $resource(config.apiUrl + "tags/"+$scope.selected.start.getTime()+"/"+$scope.selected.end.getTime()+"/10").query().$promise;
                Tags.then(function (result) {
                    $scope.tags = result;
                    if($scope.tags[0])

                });*/
            }
        });

    $( "#node-label-intensity-slider" ).slider({
      min: 0,
      max: $scope.nodelabelthreshold-1,
      value: 10-$scope.nodelabelthreshold,
      slide: function( event, ui ) {
        $scope.nodelabelthreshold = 10-ui.value;
        $scope.$apply();
      }
    });

    $( "#cooccurrence-intensity-slider-range" ).slider({
      range: true,
      min: 1,
      max: $scope.filter_occurrence_max,
      values: [ $scope.filter_occurrence_min, $scope.filter_occurrence_max ],
      slide: function( event, ui ) {
        $scope.filter_occurrence_min = ui.values[0];
        $scope.filter_occurrence_max = ui.values[1];
        $scope.$apply();
      }
    });

    $("#cooccurrence-draw-graph-spinner").spinner({
        min: 1,
        value: $scope.filter_occurrence_request,
        spin: function(event, ui) {
            $scope.filter_occurrence_request = ui.value;
        }
    });

        $scope.switchForceNodeLabel = function() {
            if ($scope.tagnl) {
                $scope.nodelabelthreshold = 0;
            } else {
                $scope.nodelabelthreshold = 10;
            }
        };

        /***** Global view *****/
        $scope.tagGraphSigma = [];

        $scope.drawGraph = function (result) {
            var drawGraph = $resource(config.apiUrl + 'draw/tagToTags/'+ $scope.layoutChoice);
            var drawgraph = drawGraph.get();
            drawgraph.$promise.then(function (result) {
                $scope.tagGraphSigma = result;
            });
        };

        $scope.generateGraph = function () {
            //$scope.filter_occ = filter_occ;
            var createGraph = $resource(config.apiUrl + 'generateTagFullGraph/' + $scope.filter_occurrence_request + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime()+"/0");
            //var createGraph = $resource(config.apiUrl + 'generateTagGraph/' + $scope.tag_id);
            var createGraphPromise = createGraph.get();
            createGraphPromise.$promise.then(function (result) {
                $scope.drawGraph();
                //console.log($scope.sigma_instance.graph.nodes())
            });
        };

        $scope.generateDownloadLink = function () {
            $("#download_link_dialog").html($rootScope.generateDownloadLinkForSigma( $scope.tagGraphSigma.nodes, $scope.tagGraphSigma.edges, 'tag_full_view'));
            $("#download_link_dialog").attr('title', 'Download a copy of the graph');
            $("#download_link_dialog").dialog("open");
        }

/*
    Generate full tag-to-tag network once when loading then compute the filtering during the drawGraph function*/

        /*** TimeLine ****/
        $scope.time_data = [];
        $scope.selected = {};
        var timeLinePromises = [];

        // Create promises array to wait all data until load
        //timeLinePromises.push($resource(config.apiUrl + 'posts/count/timestamp').query().$promise);
        //timeLinePromises.push($resource(config.apiUrl + 'comments/count/timestamp').query().$promise);

        $q.all(timeLinePromises).then(function(results) {
            var tmp = {"users": [], "posts": [], "comments": []};
            // Posts
            angular.forEach(results[0], function(result) {
                tmp.posts.push(result);
            });
            // Comments
            angular.forEach(results[1], function (result) {
                tmp.comments.push(result);
            });
            // append data
            $scope.time_data = tmp;
        }, function (reject) {
            console.log(reject);
        });

        $scope.resetTimeLine = function () {
            $scope.selected.start= new Date(0);
            $scope.selected.end= new Date(Date.now());
            $scope.extent($scope.extent.start,  $scope.extent.end);
        }

        // Time selection have been made on the chart
        $scope.extent = function (start, end) {
            if(!start && !end) { //release signal
                var Tags = $resource(config.apiUrl + "tags/"+$scope.selected.start.getTime()+"/"+$scope.selected.end.getTime()+"/"+$scope.tableSizeChoice).query().$promise;
                Tags.then(function (result) {
                    $scope.tags = result;
                    if($scope.tags[0])
                        $scope.generateGraph($scope.tag_id);
                });
                $scope.$apply();
            } else {
                $scope.selected.start = start;
                $scope.selected.end = end;
                // Update sigma filter
                $scope.filter = {"start": start.getTime(), "end": end.getTime()};
                $scope.$apply();
            }
        };


        /*** Sigma Event Catcher ***/
        $scope.eventCatcher = function (e) {
            switch(e.type) {
                case 'clickNode':
                    if (e.data.node.tag_id != undefined && (e.data.captor.ctrlKey || $scope.interactor == "information")) {
                        $scope.elementType = "tag";
                        $scope.elementId = e.data.node.tag_id;
                        $scope.openInfoPanel($scope.elementType, $scope.elementId);
                    }
                    else if ($scope.interactor == "neighbourhood") {
                        // Delegated to directive sigma.js
                    }
                    else if ($scope.interactor == "dragNode") {
                        // Delegated to directive sigma.js
                    } else {
                        console.log("Unexpected node: "+e.data.node);
                    }
                    break;
                case 'clickEdges':
                    if(e.data.edge != undefined && e.data.edge.length > 0 && ((e.data.captor.ctrlKey || $scope.interactor == "information") || (e.data.captor.shiftKey || $scope.interactor == "focus"))) {
                        $scope.content = [];
                        $scope.showTagCommonContent = true;
                        var tagPromises = [];
                        // Create promises array to wait all data until load
                        tagPromises.push($resource(config.apiUrl + "tags/common/content/"+e.data.edge[0].tag_1+"/"+e.data.edge[0].tag_2+"/"+ $scope.selected.start.getTime()+"/"+ $scope.selected.end.getTime()).query().$promise);
                        tagPromises.push($resource(config.apiUrl + 'tag/'+e.data.edge[0].tag_1).get().$promise);
                        tagPromises.push($resource(config.apiUrl + 'tag/'+e.data.edge[0].tag_2).get().$promise);
                        tagPromises[0].then(function(result) {
                            //console.log(result);
                            $scope.content = result;
                        });
                        tagPromises[1].then(function(result) {
                            //console.log(result);
                            $scope.tag_src.id = result.tag_id;
                            $scope.tag_src.label = result.label;
                          //  $scope.tag_src = result;
                        });
                        tagPromises[2].then(function(result) {
                            $scope.tag_dst.id = result.tag_id;
                            $scope.tag_dst.label = result.label;
                        });
                        e.data.edge[0].color = 'rgb(0,0,0)';
                        e.target.refresh()
                        //TODO tweek sigma renderer for immediate response
                        //var s = e.data.renderer;
                        //s.refresh();
                    }
                    break;
            }
        };

        /********* Info Panel ***************/
        $scope.openInfoPanel = function(elementType, elementId) {
            var mod = document.createElement("panel-info");
            mod.setAttribute("type", elementType);
            mod.setAttribute("id", elementId);
            mod.setAttribute("parent", $scope.infoPanelParent);
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

        /******** Interactor Manager ********/
        $scope.clearInteractor = function() {
            document.getElementById("interactorNavigate").className="btn btn-default";
            document.getElementById("interactorInformation").className="btn btn-default";
            document.getElementById("interactorNeighbourhood").className="btn btn-default";
            document.getElementById("interactorDragNode").className="btn btn-default";
            document.getElementById("interactorDescriptionLabel").innerHTML = "";
        }

        $scope.setInteractorNavigate = function () {
            $scope.clearInteractor();
            $scope.interactor="navigate";
            document.getElementById("interactorNavigate").className="btn btn-primary";
            document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorNavigate").attr("data-title");
        }

        $scope.setInteractorInformation = function () {
            $scope.clearInteractor();
            $scope.interactor="information";
            document.getElementById("interactorInformation").className="btn btn-primary";
            document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorInformation").attr("data-title");
        }

        $scope.setInteractorNeighbourhood = function () {
            $scope.clearInteractor();
            $scope.interactor="neighbourhood";
            document.getElementById("interactorNeighbourhood").className="btn btn-primary";
            document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorNeighbourhood").attr("data-title");
        }

        $scope.setInteractorDragNode = function () {
            $scope.clearInteractor();
            $scope.interactor="dragNode";
            document.getElementById("interactorDragNode").className="btn btn-primary";
            document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorDragNode").attr("data-title");
        }

        $scope.cleanRefreshSigmaDecorator = function () {
            $scope.clean_refresh_sigma_decorator++;
        }

        /*** Search Bar Catcher *****/
        $rootScope.$watch('search', function(newVal) {
            var locateTmp = [];
            if(newVal != undefined) {
                if( newVal.user_id != undefined) {
                    $scope.openInfoPanel('user',  newVal.user_id );
                }
                else if( newVal.post_id != undefined) {
                    $scope.openInfoPanel('post',  newVal.post_id );
                }
                else if( newVal.comment_id != undefined) {
                    $scope.openInfoPanel('comment',  newVal.comment_id );
                }
                else if( newVal.tag_id != undefined) {
                    $scope.openInfoPanel('tag',  newVal.tag_id );
                }
            }
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
