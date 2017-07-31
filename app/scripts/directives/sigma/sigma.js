/**
 * Created by nferon on 06/06/16.
 */
angular.module('sbAdminApp')
.directive('sigmaJs', function() {
    return {
        restrict: 'E',
        template: '<div style="width: 100%;height: 100%;"></div>',
        scope: {
            graph: '=',
            width: '@',
            height: '@',
            id: '@',
            threshold: '@?',
            edgeLabels: '=?'
        },
        link: function (scope, element) {
            // default values
            if (scope.threshold == undefined)
                scope.threshold = 4;
            if (scope.edgeLabels == undefined)
                scope.edgeLabels = false;
            // Create sigma instance
            var s = new sigma({
                renderer: {
                    container: element[0].firstChild,
                    type: 'canvas'
                },
                settings: {
                    labelThreshold: scope.threshold,
                    labelSize: "fixed",
                    drawEdgeLabels: scope.edgeLabels,
                    minArrowSize: 5,
                    enableEdgeHovering: false,
                    edgeHoverColor: '#000',
                    defaultEdgeHoverColor: '#000',
                    edgeHoverSizeRatio: 2,
                    edgeHoverExtremities: true,
                    maxNodeSize: scope.maxNodeSize
                }
            });
            scope.s = s;

            /**** Bind Event ****/
            s.bind('clickNodes clickEdges hovers', function(e) {
                scope.eventCatcher()(e);
            });
            /**** Watch for update ****/
            scope.$watch('graph', function() {
                s.graph.clear();
                s.graph.read(scope.graph);
                s.refresh();
            });
            scope.$watch('edgeLabels', function(newVal) {
                s.graph.clear();
                s.settings({
                    drawEdgeLabels: newVal
                });
                s.graph.read(scope.graph);
                s.refresh();
            });
            scope.$watch('threshold', function(newVal) {
                s.graph.clear();
                s.settings({
                    labelThreshold: newVal
                });
                s.graph.read(scope.graph);
                s.refresh();
            });
            scope.$watch('width', function() {
                element.children().css("width",scope.width);
                s.refresh();
                window.dispatchEvent(new Event('resize')); //hack so that it will be shown instantly
            });
            scope.$watch('height', function() {
                element.children().css("height",scope.height);
                s.refresh();
                window.dispatchEvent(new Event('resize'));//hack so that it will be shown instantly
            });
            element.on('$destroy', function() {
                s.graph.clear();
            });
        }
    };
});
