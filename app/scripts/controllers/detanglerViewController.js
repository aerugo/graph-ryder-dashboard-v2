/**
 * Created by adrien Dufraux on 12/06/17.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:detanglerViewController
 * @description
 * # detanglerViewController
 * Controller of the sbAdminApp
 */

 angular.module('sbAdminApp')
     .controller('DetanglerViewCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q, $location, $timeout, $compile) {

         /**** Init ****/
         //edge label default
         $scope.tagel = false;
         $scope.tagnl = false;
         $scope.userel = false;
         $scope.usernl = false;
         $scope.nodeTagelThreshold = 10;
         $scope.nodeTagelThresholdMax = 10;
         $scope.nodeUserelThresholdMax = 10;
         $scope.nodeUserelThreshold = 10;
         $scope.locate = "";
         $scope.filter_occurence_tag_min = "2";
         $scope.filter_occurence_tag_max = "100";
         $scope.tag_id = 1879;
         $scope.tag_src = {id: $scope.tag_id, label:""};
         $scope.tag_dst = {id: -1, label:""};
         $scope.requestFullTagGraph = false;
         $scope.showTagCommonContent = false;
         $scope.tableSizeChoice = '10';
         $scope.userinteractor = "navigate";
         $scope.taginteractor = "navigate";
         $scope.userVennInteractor = "union"
         $scope.tagVennInteractor = "union"
         $scope.infoPanelParent = "infoPanelParent";
         $scope.selected = {}; //test
         $scope.selected.start= new Date(0);
         $scope.selected.end= new Date(Date.now());
         $scope.layoutChoice = 'Circular';
         $scope.defaultUserNodeColor = '';
         $scope.defaultTagNodeColor = '';
         $scope.s_user = undefined;
         $scope.user_graph_intact = {};
         $scope.tag_graph_intact = {};
         $scope.s_tag = undefined;
         $scope.lasso_user = {};
         $scope.lasso_tag = {};
         $scope.isCheckedUser = false;
         $scope.tab_users = [];
         $scope.tab_tags = [];
         $scope.communityManagers = ["Alberto", "Nadia", "Noemi"];
         $scope.metricFilter = "occ";
         $scope.configAtlasForceAlgo = {scalingRatio:1,strongGravityMode:false,gravity:3,adjustSizes:true};

         // When rootScope is ready load the graph
         $rootScope.$watch('ready', function(newVal) {
             if(newVal) {
                 $scope.layoutChoice = $rootScope.layout[12];
                 $scope.userGraphRessource = $resource(config.apiUrl + 'draw/usersToUsers/' + $scope.layoutChoice);
                 $scope.tagGraphRessource = $resource(config.apiUrl + 'draw/tagToTags/'+ $scope.layoutChoice);

                 $scope.drawUserGraph(true);
                 $scope.drawTagGraph(true);
                 //$scope.generateTagGraph();
                 //$scope.generateUserGraph();

             }
         });

         $scope.fctUnion = function (tab_ini, tab_to_merge){
           if (tab_ini == undefined){
             tab_ini = [];
           }
           return [...new Set([...tab_ini ,...tab_to_merge])];
         }

         $scope.fctIntersect = function (tab_ini, tab_to_merge){
            if (tab_ini == undefined){
              return tab_to_merge;
            }
            else if (tab_ini.length == 0){
              return []
            }
            else{
              return [...new Set(tab_ini.filter(x => new Set(tab_to_merge).has(x)))];
              //new Set([...setA].filter(x => setB.has(x)));
            }
          }

         //We handle above the union/intersection feature
         $scope.$watch("userVennInteractor", function() {
           if ($scope.userVennInteractor == "union"){
             $scope.selectTagNodes = $scope.fctUnion;
           }
           if ($scope.userVennInteractor == "intersect"){
             $scope.selectTagNodes = $scope.fctIntersect;
            }
           if ($scope.lasso_user != undefined && $scope.lasso_user.selectedNodes != undefined && $scope.lasso_user.selectedNodes.length != 0){
              $scope.refreshTagView();
           }
         });

         $scope.$watch("tagVennInteractor", function() {
           if ($scope.tagVennInteractor == "union"){
             $scope.selectUserNodes = $scope.fctUnion;
           }
           if ($scope.tagVennInteractor == "intersect"){
             $scope.selectUserNodes = $scope.fctIntersect;
            }
           if ($scope.lasso_tag != undefined && $scope.lasso_tag.selectedNodes != undefined && $scope.lasso_tag.selectedNodes.length != 0){
              $scope.refreshUserView();
           }
         });

         $scope.refreshTagView = function(){

           //Set the default properties
           $scope.s_tag.graph.edges().forEach(function (edge) {
             edge.hidden = false;
           });

           $scope.s_tag.graph.nodes().forEach(function (node) {
             node.color = $scope.defaultTagNodeColor;
             node.hidden = true;
             node.couldAppear = false;
           });

           $scope.s_user.graph.nodes().forEach(function (node) {
             node.color = $scope.defaultUserNodeColor;
           });

           //We search what are the tags that must be colored
           $scope.tab_tags = undefined;
           $scope.lasso_user.selectedNodes.forEach(function (node) {
              node.color = 'rgb(42, 187, 155)';
              if (node.tagsAssociateNodeTlp != undefined) {
                var text = node.tagsAssociateNodeTlp
                var tab_few_tag = eval("[" + text.substring(1,text.length-1) + "]")
              }
              else{
                var tab_few_tag = [];
              }
              $scope.tab_tags = $scope.selectTagNodes($scope.tab_tags,tab_few_tag);
           });

           //We will display only the selected users and the nodes that are connected to the selection.
           if ($scope.lasso_user.selectedNodes.length != 0){

           }

           //We filter the tags and we change the color.
           if ($scope.tab_tags != undefined){
             $scope.s_tag.graph.nodes().filter( function (node){
                return $scope.tab_tags.indexOf(parseInt(node.tag_id)) > -1
             }).forEach( function (node){
                node.color = 'rgb(42, 187, 155)';
                if (Number(node[$scope.metricFilter]) >= Number($scope.filter_occurence_tag_min) && Number(node[$scope.metricFilter]) <= Number($scope.filter_occurence_tag_max)){
                  node.hidden = false;
                }
                else{
                  node.hidden = true;
                }
                node.couldAppear = true;
             });
           }

           if (($scope.tab_tags != undefined && $scope.tab_tags.length == 0) || $scope.tab_tags == undefined){
             $scope.s_tag.graph.nodes().forEach(function (node) {
               if (Number(node[$scope.metricFilter]) >= Number($scope.filter_occurence_tag_min) && Number(node[$scope.metricFilter]) <= Number($scope.filter_occurence_tag_max)){
                 node.hidden = false;
               }
               else{
                 node.hidden = true;
               }
               node.couldAppear = true;
             });
           }

           $scope.s_tag.refresh();
           $scope.s_user.refresh();
           $scope.lasso_user.deactivate();
           $scope.lasso_user.activate();
         }

         $scope.refreshUserView = function(){

           //Set the default properties
           $scope.s_user.graph.edges().forEach(function (edge) {
             edge.hidden = false;
           });

           $scope.s_user.graph.nodes().forEach(function (node) {
             node.color = $scope.defaultUserNodeColor;
             node.hidden = true;
             node.couldAppear = false;
           });

           $scope.s_tag.graph.nodes().forEach(function (node) {
             node.color = $scope.defaultTagNodeColor;
           });

           //We search what are the users that must be colored
           $scope.tab_users = undefined;
           $scope.lasso_tag.selectedNodes.forEach(function (node) {
              node.color = 'rgb(42, 187, 155)';
              if (node.usersAssociateNodeTlp != undefined) {
                var text = node.usersAssociateNodeTlp
                var tab_few_user = eval("[" + text.substring(1,text.length-1) + "]")
              }
              else{
                var tab_few_user = [];
              }
              $scope.tab_users = $scope.selectUserNodes($scope.tab_users,tab_few_user);
           });

           //We filter the users and we change the color.
           if ($scope.tab_users != undefined){
             $scope.s_user.graph.nodes().filter( function (node){
                return $scope.tab_users.indexOf(parseInt(node.user_id)) > -1
             }).forEach( function (node){
                node.color = 'rgb(42, 187, 155)';
                node.hidden = false;
                if ($scope.isCheckedUser){
                  if ($scope.communityManagers.indexOf(node.name) > -1){
                    node.hidden = true;
                  }
                }
                node.couldAppear = true;
             });
          }
           if (($scope.tab_users != undefined && $scope.tab_users.length == 0) || $scope.tab_users == undefined){
             $scope.s_user.graph.nodes().forEach(function (node) {
               node.hidden = false;
               if ($scope.isCheckedUser){
                 if ($scope.communityManagers.indexOf(node.name) > -1){
                   node.hidden = true;
                 }
               }
               node.couldAppear = true;
             });
           }


           $scope.s_tag.refresh();
           $scope.s_user.refresh();
           $scope.lasso_tag.deactivate();
           $scope.lasso_tag.activate();
         }


         //We want to bind the lasso when s_tag and s_user are ready
         var toUnBind1 = $scope.$watch("s_tag", function() {
           if ($scope.s_tag != undefined) {
             //When the lasso_user catch new nodes
             $scope.lasso_user.bind('selectedNodes', function (event) {
               $scope.refreshTagView();
             });

             //When the lasso_tag catch new nodes
             $scope.lasso_tag.bind('selectedNodes', function (event) {
               $scope.refreshUserView();
             });

             var toUnBind2 = $scope.$watch("s_tag.ready", function (){
               if ($scope.s_tag.ready == true){
                 $scope.s_tag.graph.nodes().forEach(function (node) {
                   node.hidden = false;
                 });
                 $scope.s_tag.graph.edges().forEach(function (edge) {
                   edge.hidden = false;
                 });

                 $scope.tag_graph_intact.nodes = jQuery.extend(true,[], $scope.s_tag.graph.nodes());
                 $scope.tag_graph_intact.edges = jQuery.extend(true,[], $scope.s_tag.graph.edges());
                 toUnBind2();
               }
             });

             var toUnBind3 = $scope.$watch("s_user.ready", function (){
               if ($scope.s_user.ready == true){
                 $scope.s_user.graph.nodes().forEach(function (node) {
                   node.hidden = false;
                 });
                 $scope.s_user.graph.edges().forEach(function (edge) {
                   edge.hidden = false;
                 });

                 $scope.user_graph_intact.nodes = jQuery.extend(true,[], $scope.s_user.graph.nodes());
                 $scope.user_graph_intact.edges = jQuery.extend(true,[], $scope.s_user.graph.edges());
                 toUnBind3();
               }
             });



             toUnBind1(); //We stop the watcher wich is useless now.
           }
         });


         //Jquery handle user sliders
         $( "#node-label-user-intensity-slider" ).slider({
             min: 0,
             max: $scope.nodeUserelThresholdMax-1,
             value: $scope.nodeUserelThresholdMax-$scope.nodeUserelThreshold ,
             slide: function( event, ui ) {
                 $scope.nodeUserelThreshold = $scope.nodeUserelThresholdMax-ui.value;
                 $scope.$apply();
             }
         });

         //Jquery handle tag sliders
         $( "#node-label-tag-intensity-slider" ).slider({
             min: 0,
             max: $scope.nodeTagelThresholdMax-1,
             value: $scope.nodeTagelThresholdMax-$scope.nodeTagelThreshold ,
             slide: function( event, ui ) {
                 $scope.nodeTagelThreshold = $scope.nodeTagelThresholdMax-ui.value;
                 $scope.$apply();
             }
         });

         $( "#coocurrence-intensity-slider-range" ).slider({
             range: true,
             min: 1,
             max: $scope.filter_occurence_tag_max,
             values: [ $scope.filter_occurence_tag_min, $scope.filter_occurence_tag_max ],
             slide: function( event, ui ) {
                 $scope.filter_occurence_tag_min = ui.values[0];
                 $scope.filter_occurence_tag_max = ui.values[1];
                 $scope.$apply();
             }
         });



         /*** user view ***/
         $scope.usersGraphSigma = [];

         $scope.drawUserGraph = function (suggestions) {
             $scope.drawUserGraphPromise = $scope.userGraphRessource.get();
             $scope.drawUserGraphPromise.$promise.then(function (result) {
                 $scope.usersGraphSigma = result;
                 $scope.defaultUserNodeColor = $scope.usersGraphSigma.nodes[0].color
                 /*
                 if(suggestions) {
                     $rootScope.suggestions = [];
                     angular.forEach($scope.nodes, function (node) {
                         if (node.name != undefined) {
                             node.label = node.name;
                             $rootScope.suggestions.push(node);
                         }
                     });
                 }
                 */
             });
         };

         $scope.tagsGraphSigma = [];

         $scope.drawTagGraph = function (result) {
             $scope.drawTagGraphPromise = $scope.tagGraphRessource.get();
             $scope.drawTagGraphPromise.$promise.then(function (result) {
                 $scope.tagsGraphSigma = result;
                  $scope.defaultTagNodeColor = $scope.tagsGraphSigma.nodes[0].color
             });
         };

         $scope.generateTagGraph = function () {
             //$scope.filter_occ = filter_occ;
             var createGraph = $resource(config.apiUrl + 'generateTagFullGraph/' + $scope.filter_occurence_tag_min + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime()+"/0");
             var createGraphPromise = createGraph.get();
             createGraphPromise.$promise.then(function (result) {
                 $scope.drawTagGraph();
             });
         };

         $scope.generateUserGraph = function () {
             //$scope.filter_occ = filter_occ;
             var createGraph = $resource(config.apiUrl + 'generateUserGraph');
             var createGraphPromise = createGraph.get();
             createGraphPromise.$promise.then(function (result) {
                 $scope.drawUserGraph();
             });
         };

         /******** Interactor Manager ********/
         $scope.clearUserInteractor = function() {
             document.getElementById("interactorUserNavigate").className="btn btn-default";
             //document.getElementById("interactorUserSelectNode").className="btn btn-default";
             document.getElementById("interactorUserDragNode").className="btn btn-default";
             document.getElementById("interactorUserLasso").className="btn btn-default";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = "";
         }

         $scope.setInteractorUserNavigate = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="navigate";
             document.getElementById("interactorUserNavigate").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserNavigate").attr("data-title");
         }

         $scope.setInteractorUserNodeSelection = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="nodeSelection";
             document.getElementById("interactorUserSelectNode").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserSelectNode").attr("data-title");
         }

         $scope.setInteractorUserDragNode = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="dragNode";
             document.getElementById("interactorUserDragNode").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserDragNode").attr("data-title");
         }

         $scope.setInteractorUserLasso = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="lasso";
             document.getElementById("interactorUserLasso").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserLasso").attr("data-title");
         }


         $scope.clearUserVennInteractor = function() {
             document.getElementById("interactorUserUnion").className="btn btn-default";
             document.getElementById("interactorUserIntersect").className="btn btn-default";
         }

         $scope.setInteractorUserUnion = function () {
             $scope.clearUserVennInteractor();
             $scope.userVennInteractor ="union";
             document.getElementById("interactorUserUnion").className="btn btn-primary";
         }

         $scope.setInteractorUserIntersect = function () {
             $scope.clearUserVennInteractor();
             $scope.userVennInteractor ="intersect";
             document.getElementById("interactorUserIntersect").className="btn btn-primary";
         }


         $scope.setInteractorUserRemoveManagers = function (check) {
           $scope.isCheckedUser = check;
           $scope.refreshUserView();
         }



         $scope.clearTagInteractor = function() {
             document.getElementById("interactorTagNavigate").className="btn btn-default";
             //document.getElementById("interactorTagSelectNode").className="btn btn-default";
             document.getElementById("interactorTagDragNode").className="btn btn-default";
             document.getElementById("interactorTagLasso").className="btn btn-default";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = "";
         }

         $scope.setInteractorTagNavigate = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="navigate";
             document.getElementById("interactorTagNavigate").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagNavigate").attr("data-title");
         }

         $scope.setInteractorTagNodeSelection = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="nodeSelection";
             document.getElementById("interactorTagSelectNode").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagSelectNode").attr("data-title");
         }

         $scope.setInteractorTagDragNode = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="dragNode";
             document.getElementById("interactorTagDragNode").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagDragNode").attr("data-title");
         }

         $scope.setInteractorTagLasso = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="lasso";
             document.getElementById("interactorTagLasso").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagLasso").attr("data-title");
         }

         $scope.clearTagVennInteractor = function() {
             document.getElementById("interactorTagUnion").className="btn btn-default";
             document.getElementById("interactorTagIntersect").className="btn btn-default";
         }

         $scope.setInteractorTagUnion = function () {
             $scope.clearTagVennInteractor();
             $scope.tagVennInteractor ="union";
             document.getElementById("interactorTagUnion").className="btn btn-primary";
         }

         $scope.setInteractorTagIntersect = function () {
             $scope.clearTagVennInteractor();
             $scope.tagVennInteractor ="intersect";
             document.getElementById("interactorTagIntersect").className="btn btn-primary";
         }

         $scope.setInteractorUserLayoutStop = function () {
           if (document.getElementById("interactorUserLayoutStop").className != "btn btn-primary"){
               document.getElementById("interactorUserLayoutStop").className="btn btn-primary";
               document.getElementById("interactorUserLayoutPlay").className="btn btn-default";

               $scope.s_user.stopForceAtlas2();
            }
         }

         $scope.setInteractorUserLayoutPlay = function () {
           if (document.getElementById("interactorUserLayoutPlay").className != "btn btn-primary"){

             document.getElementById("interactorUserLayoutPlay").className="btn btn-primary";
             document.getElementById("interactorUserLayoutStop").className="btn btn-default";


             var nodeToAdd = [];
             var edgeToAdd = [];


             $scope.s_user.graph.nodes().forEach(function (node) {
               if (node.hidden == false){
                 nodeToAdd.push(jQuery.extend(true,{},node));
               }
             });

              $scope.s_user.graph.edges().forEach(function (edge) {
                if ($scope.s_user.graph.nodes(edge.source).hidden == false && $scope.s_user.graph.nodes(edge.target).hidden == false){
                  edgeToAdd.push(jQuery.extend(true,{},edge));
                }
             });

             $scope.s_user.graph.clear();

             nodeToAdd.forEach(function (node) {
               $scope.s_user.graph.addNode(node);
             });

             edgeToAdd.forEach(function (edge) {
               $scope.s_user.graph.addEdge(edge);
             });



              $scope.s_user.refresh();
              $scope.s_user.killForceAtlas2();
              $scope.s_user.startForceAtlas2($scope.configAtlasForceAlgo);
           }
         }

         $scope.setInteractorUserLayoutReset = function () {
           $scope.s_user.graph.clear();

           $scope.user_graph_intact.nodes.forEach(function (node) {
             $scope.s_user.graph.addNode(jQuery.extend(true,{},node));
           })

           $scope.user_graph_intact.edges.forEach(function (edge) {
             $scope.s_user.graph.addEdge(jQuery.extend(true,{},edge));
           })

           $scope.s_user.refresh();
         }

         $scope.setInteractorTagLayoutStop = function () {
           if (document.getElementById("interactorTagLayoutStop").className != "btn btn-primary"){
             document.getElementById("interactorTagLayoutStop").className="btn btn-primary";
             document.getElementById("interactorTagLayoutPlay").className="btn btn-default";

             $scope.s_tag.stopForceAtlas2();
           }

         }

         $scope.setInteractorTagLayoutPlay = function () {
           if (document.getElementById("interactorTagLayoutPlay").className != "btn btn-primary"){

             document.getElementById("interactorTagLayoutPlay").className="btn btn-primary";
             document.getElementById("interactorTagLayoutStop").className="btn btn-default";

             var nodeToAdd = [];
             var edgeToAdd = [];


             $scope.s_tag.graph.nodes().forEach(function (node) {
               if (node.hidden == false){
                 nodeToAdd.push(jQuery.extend(true,{},node));
               }
             });

              $scope.s_tag.graph.edges().forEach(function (edge) {
                if ($scope.s_tag.graph.nodes(edge.source).hidden == false && $scope.s_tag.graph.nodes(edge.target).hidden == false){
                  edgeToAdd.push(jQuery.extend(true,{},edge));
                }
             });

             $scope.s_tag.graph.clear();

             nodeToAdd.forEach(function (node) {
               $scope.s_tag.graph.addNode(node);
             });

             edgeToAdd.forEach(function (edge) {
               $scope.s_tag.graph.addEdge(edge);
             });



              $scope.s_tag.refresh();
              $scope.s_tag.killForceAtlas2();
              $scope.s_tag.startForceAtlas2($scope.configAtlasForceAlgo);
           }
         }

         $scope.setInteractorTagLayoutReset = function () {
           $scope.s_tag.graph.clear();

           $scope.tag_graph_intact.nodes.forEach(function (node) {
             $scope.s_tag.graph.addNode(jQuery.extend(true,{},node));
           })

           $scope.tag_graph_intact.edges.forEach(function (edge) {
             $scope.s_tag.graph.addEdge(jQuery.extend(true,{},edge));
           })

           $scope.s_tag.refresh();
         }



         /*** Sigma Event Catcher ***/
         $scope.eventCatcher = function (e) {};

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
