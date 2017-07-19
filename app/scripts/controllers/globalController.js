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
                $scope.selected.start= new Date(0);
                $scope.selected.end= new Date(Date.now());
                $scope.updateLatest();
                //$scope.drawGraph();
                getStatus();
                //refreshPostType();
                $scope.refreshWordcloud();
                $rootScope.resetSuggestions(true, true, true, true);
            }
        });

        /***** Wordcloud *****/
        $scope.refreshWordcloud = function() {
            if (WordCloud.isSupported) {
                var startTime = new Date(0);
                var endTime = new Date(Date.now());
                if($scope.selected.start != undefined)
                    startTime = $scope.selected.start;
                if($scope.selected.end != undefined)
                    endTime = $scope.selected.end;
                var limit = 200;
                var Tags = $resource(config.apiUrl + "tags/"+startTime.getTime()+"/"+ endTime.getTime()+"/"+limit).query().$promise;
                Tags.then(function (result) {
                    var list = [];
                    for (var i=0; i< limit; i++) {
                        if (result[i] != undefined) {
                            list.push([result[i]["label"], result[i]["count"], result[i]["id"]])
                        }
                    }
                    if (list.length < 1) {
                        list.push(["none", 50, -1])
                    }
                    WordCloud.minFontSize = "10px"
                    WordCloud(document.getElementById('word_cloud'), {list:list, gridSize: 5, weightFactor: 0.6,   click: function(item) { $scope.openInfoPanel('tag', item[2]);}});
                });
            }
        };

        /**** Update latest lists ****/
        $scope.updateLatest = function () {
            // // Read the complete graph from api
            $scope.latest_comments = [];
            var resComment = $resource(config.apiUrl + 'comments/latest');
            $scope.resCommentPromise = resComment.query();
            $scope.resCommentPromise.$promise.then(function (result) {
                $scope.latest_comments = result;
            });
            $scope.latest_posts = [];
            var resPost = $resource(config.apiUrl + 'posts/latest');
            $scope.resPostPromise = resPost.query();
            $scope.resPostPromise.$promise.then(function (result) {
                $scope.latest_posts = result;
            });
        };


        /***** Global view *****/
        $scope.globalGraphSigma = [];

        $scope.drawGraph = function () {
            // // Read the complete graph from api
            var drawGraph = $resource(config.apiUrl + 'draw/complete/' + $scope.layoutChoice);
            $scope.drawGraphPromise = drawGraph.get();
            $scope.drawGraphPromise.$promise.then(function (result) {
                $scope.globalGraphSigma = result;
            });
        };

        /*** TimeLine ****/
        $scope.time_data = [];
        $scope.selected = {};
        var timeLinePromises = [];

        // Create promises array to wait all data until load
        timeLinePromises.push($resource(config.apiUrl + 'users/count/timestamp').query().$promise);
        timeLinePromises.push($resource(config.apiUrl + 'posts/count/timestamp').query().$promise);
        timeLinePromises.push($resource(config.apiUrl + 'comments/count/timestamp').query().$promise);

        $q.all(timeLinePromises).then(function(results) {
            var tmp = {"users": [], "posts": [], "comments": []};
            // Users
            angular.forEach(results[0], function(result) {
                tmp.users.push(result);
            });
            // Posts
            angular.forEach(results[1], function(result) {
                tmp.posts.push(result);
            });
            // Comments
            angular.forEach(results[2], function (result) {
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
            $scope.filter = {"start": $scope.selected.start.getTime(), "end": $scope.selected.end.getTime()};
        }

        // Time selection have been made on the chart
        $scope.extent = function (start, end) {
            if(!start && !end) { //release signal
                //refreshPostType();
                $scope.refreshWordcloud();
            } else {
                $scope.selected.start = start;
                $scope.selected.end = end;
                // Update sigma filter
                $scope.filter = {"start": start.getTime(), "end": end.getTime()};
                $scope.$apply();
            }
        };

        /*** Radar Chart ***/
        var all = {name: "opencare"};
        var postSelection = [all];

        // Call api and load postType
        var refreshPostType = function () {
            $scope.postType = {};
            $scope.postType.series = [];
            $scope.postType.labels = [];

            var params = {"users": []};

            angular.forEach(postSelection, function(selection) {
                if(selection != all) {
                    params.uid.push(selection.id);
                    $scope.postType.series.push(selection.name);
                }
            });

            if($scope.selected.start != undefined)
                params.start = $scope.selected.start.getTime();
            if($scope.selected.end != undefined)
                params.end = $scope.selected.end.getTime();

            var Type = $resource(config.apiUrl + 'status', params);
            var type = Type.get();
            type.$promise.then(function (result) {
                $scope.postType.labels = result.labels;
                if(postSelection.indexOf(all) != -1) {
                    $scope.postType.data = result.data;
                    $scope.postType.series.push("opencare");
                }
                else {
                    result.data.shift();
                    $scope.postType.data = result.data;
                }
            });
        };

        var getStatus = function () {
            $scope.DBStatus = {};
            var params = {};

            if($scope.selected.start != undefined)
                params.start = $scope.selected.start.getTime();
            if($scope.selected.end != undefined)
                params.end = $scope.selected.end.getTime();

            var resStatus = $resource(config.apiUrl + 'status', params).get();
            resStatus.$promise.then(function (result) {
                for (var i=0; i<result["labels"].length; i++) {
                    $scope.DBStatus[result["labels"][i]]=result["data"][0][i]
                }
            });
        };

        var postTypeAddUser = function (uid, name, append) {
            if(append)
                postSelection.push({id: uid, name: name});
            else
                postSelection = [{id: uid, name: name}];
            refreshPostType();
        };

        /*** Sigma Event Catcher ***/
        $scope.eventCatcher = function (e) {
            switch(e.type) {
                case 'clickNode':
                    if(e.data.node.uid != undefined && e.data.captor.altKey) {
                        postTypeAddUser(e.data.node.uid, e.data.node.name, e.data.captor.shiftKey);
                    }
                    else {
                        if(e.data.node.user_id != undefined) {
                            $scope.elementType = "user";
                            $scope.elementId = e.data.node.user_id
                        }
                        else if (e.data.node.post_id != undefined) {
                            $scope.elementType = "post";
                            $scope.elementId = e.data.node.post_id;
                        }
                        else if (e.data.node.comment_id != undefined) {
                            $scope.elementType = "comment";
                            $scope.elementId = e.data.node.comment_id;
                        }
                        else if (e.data.node.tag_id != undefined) {
                            $scope.elementType = "tag";
                            $scope.elementId = e.data.node.tag_id;
                        }
                        else if (e.data.node.annotation_id != undefined) {
                            $scope.elementType = "annotation";
                            $scope.elementId = e.data.node.annotation_id;
                        }
                        else {
                            console.log("Unexpected node: "+e.data.node);
                        }
                        $scope.openInfoPanel($scope.elementType, $scope.elementId);
                    }
                    break;
            }
        };

        /********* Info Panel ***************/
        $scope.openInfoPanel = function(elementType, elementId) {
            if (elementId < 0) {
                return;
            }
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
                /*if (!$scope.drawGraphPromise.$resolved) // todo do not wait but cancel the promise
                    $timeout(function() {$scope.locate = locateTmp;}, 5000);
                else
                    $scope.locate = locateTmp;*/
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
