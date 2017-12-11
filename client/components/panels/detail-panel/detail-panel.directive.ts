'use strict';
const angular = require('angular');

import 'bootstrap';
import 'jquery';
import 'jquery-ui-bundle';


export default angular.module('graphRyderDashboardApp.detailPanel', [])
  .directive('detailPanel', function($http, $timeout, $compile) {
    return {
      template: require('./detail-panel.html'),
      restrict: 'E',
      replace: true,
      scope: {
        settings: '=',
        handler: '&'
      },
      link: function(scope, element) {
        element.draggable({handle: '.panel-heading', containment: '#main-view', scroll: false, stack: '.panel',
          start: function() {
            if (element.css('z-index') > 100) {
              element.css('z-index', 10);
            }
        }, stop: function(event, ui) {
            scope.settings.style.css = scope.settings.style.css.split('top:')[0] + 'top: ' + ui.position.top + 'px; left : ' + ui.position.left + 'px;';
          }});
        element.resizable({minHeight: 150, minWidth: 150, stop: function(event, ui) {
          scope.settings.style.css = 'width: ' + ui.size.width + 'px; height: ' + ui.size.height + 'px; top: ' + ui.position.top + 'px; left : ' + ui.position.left + 'px;';
        }});
        let loaded = false;
        scope.values = {};
        scope.newkey = '';
        scope.node = {};
        scope.attributs = {};
        scope.menu = [];
        scope.newPid = -1;
        scope.keys = [];

        scope.load = function(){
          /***** Load properties & attributes *******/
          if (!loaded && scope.settings.id) {
            $http.get('/api/data/getLabels/' + scope.settings.id).then(labels => {
              scope.labels = labels.data;
              if (scope.labels.indexOf('Link') !== -1) {
                scope.isEdge = true;
              }
              if (scope.labels.indexOf('Time') !== -1) {
                scope.settings.style.css = 'width: 450px; height: 200px; top: ' + (Math.random() * (10 - 20) + 20) + 'vh; left : ' + (Math.random() * (30 - 40) + 30) + 'vh;';
              }
              angular.forEach(scope.labels, function(label) {
                $http.get('/api/model/label/' + label).then(model => {
                  if (model.data.color) { //todo add additional info like Require and order
                    $http.get('/api/data/getProperties/' + scope.settings.id).then(response => {
                      scope.getProperties(model.data);
                      angular.forEach(Object.keys(response.data), function(p) {
                        // if (Object.keys(response.data).indexOf(p) !== -1) {
                        if (p !== 'id') {
                          scope.node[p] = response.data[p];
                        }
                        scope.keys = Object.keys(scope.node);
                        scope.suggestValue(scope.realLabel, p);
                      });
                    });
                    scope.node.create = [];
                    scope.node.delete = [];
                    scope.node.addAttrs = [];
                    scope.node.delAttrs = [];
                    scope.node.reverse = false;
                    if (scope.settings.node) {
                      scope.node.source = scope.settings.node[0].id;
                      scope.node.target = scope.settings.node[1].id;
                    }
                    loaded = true;
                  }
                });
              });
            });
            $http.get('/api/data/getAttributes/' + scope.settings.id).then(response => {
              angular.forEach(response.data, function(attrs, key) {
                if (key !== 'Node' && key !== 'id') {
                  // if (key.substring(0, 4) === 'Geo:') {
                  //   if (!Object.keys(scope.attributs).includes(key)) {
                  //     scope.attributs[key.split(':').slice(-1).pop()] = [];
                  //   }
                  //   $http.get('/api/model/label/' + key.split(':')[1]).then(m => {
                  //     angular.forEach(attrs, function(attr) {
                  //       $http.get('/api/data/getProperties/' + attr).then(r => {
                  //         scope.attributs[key.split(':').slice(-1).pop()].push({id: attr, value:  r.data[m.data.labeling]});
                  //       });
                  //     });
                  //   });
                  // } else if (key.substring(0, 5) === 'Time:') {
                  //   if (!Object.keys(scope.attributs).includes(key)) {
                  //     scope.attributs[key.split(':').slice(-1).pop()] = [];
                  //   }
                  //   $http.get('/api/model/label/' + key.split(':')[1]).then(m => {
                  //     angular.forEach(attrs, function(attr) {
                  //       $http.get('/api/data/getProperties/' + attr).then(r => {
                  //         scope.attributs[key.split(':').slice(-1).pop()].push({id: attr, value: r.data[m.data.labeling]});
                  //       });
                  //     });
                  //   });
                  // } else {
                  if (!Object.keys(scope.attributs).includes(key)) {
                    scope.attributs[key.split(':').slice(-1).pop()] = [];
                  }
                  $http.get('/api/model/label/' + key.split(':')[0]).then(m => {
                    angular.forEach(attrs, function(attr) {
                      $http.get('/api/data/getProperties/' + attr).then(r => {
                        scope.attributs[key.split(':').slice(-1).pop()].push({id: attr, value: r.data[m.data.labeling]});
                      });
                    });
                  });
                }
              });
            });
          }
          /****** New Item ******/
          if (!loaded && !scope.settings.id) {
            scope.node = {};
            scope.labelsList = [];
            scope.parents = {};
            $http.get('/api/model/').then(model => {
              angular.forEach(model.data, function(label) {
                if (scope.settings.type === 'createNode' && label.children.length === 0  && label.parents.indexOf('Link') === -1 && label.parents.indexOf('Property') === -1 && label.parents.indexOf('Time') === -1 && label.label !== 'TimeTreeRoot') {
                  scope.labelsList.push(label);
                  scope.isEdge = false;
                } else if (scope.settings.type === 'createEdge' && label.children.length === 0  && label.parents.indexOf('Link') !== -1 && label.label !== 'Prop' && label.label !== 'Attr') {
                  scope.labelsList.push(label);
                  scope.isEdge = true;
                }
              });
              scope.node.create = [];
              scope.node.delete = [];
              scope.node.addAttrs = [];
              scope.node.delAttrs = [];
              loaded = true;
            });
          }
        };

        scope.getProperties = function (label) {
          scope.realLabel = label;
          if (label.parents) {
            scope.labels = label.parents.concat(label.label);
          }
          scope.suggestValue(scope.realLabel, label.labeling);
          // angular.element("#" + label.labeling).focus(); // todo does not work
          $http.get('/api/data/getPropertiesByLabel/' + label.label).then(response => {
            scope.properties = $(response.data).not(Object.keys(scope.node)).get();
          });
        };
        /****** Search for available values ******/
        scope.suggestValue = function (label, key) {
          if (key) {
            $http.get('/api/data/getPropertyValue/' + label.label + '/' + key).then(propertyValue => {
              scope.values[key] = propertyValue.data;
            });
          }
        };
        scope.addNewKey = function (key) {
          if ( key !== '') {
            scope.node[key] = [{value: '', pid: scope.newPid, attrs: []}];
            scope.keys.push(key);
            scope.newPid--;
            scope.getProperties(scope.realLabel);
            scope.suggestValue(scope.realLabel, key);
            // angular.element("#" + key).focus(); // todo does not work
          }
        };

        /****** Update the element *****/
        scope.update = function() {
          $http.put('/api/data/set/' + scope.settings.id, scope.node).then(response => {
            if (scope.node.reverse) {
              scope.handler({e: {
                type: 'reverseEdge',
                position: scope.settings.position,
                element: scope.settings.element,
                id: scope.settings.id,
              }});
            }
            // todo check the response
            scope.close();
          });
        };

        /****** Delete the element *****/
        scope.delete = function() {
          $http.delete('/api/data/' + scope.settings.id).then(response => {
            // todo check the response
            scope.close();
            if (scope.labels.indexOf('Link')  === -1) {
              scope.handler({e: {
                type: 'deleteNode',
                node: [{id: scope.settings.id}],
                element: scope.settings.element
              }});
            } else {
              scope.handler({e: {
                type: 'deleteEdge',
                node: [{id: scope.settings.id}],
                element: scope.settings.element
              }});
            }
          });
        };

        /****** Create the element *****/
        scope.create = function() {
          scope.node.labels = scope.labels;
          $http.post('/api/data/createNode/', scope.node).then(response => {
            scope.close();
            let label = response.data;
            if (Object.keys(scope.node).indexOf(scope.realLabel.labeling) !== -1) {
              label = scope.node[scope.realLabel.labeling][0].value;
            }
            if (scope.settings.type === 'createNode') {
              scope.handler({e: {
                type: 'addNodeGo',
                position: scope.settings.position,
                element: scope.settings.element,
                id: response.data,
                label: label,
                labels: scope.node.labels,
                color: scope.realLabel.color
              }});
            } else if (scope.settings.type === 'createEdge') {
              let edge = {id: response.data, source: scope.settings.node[0].id, target: scope.settings.node[1].id}; // todo clean
              let event = {
                type: 'addEdgeGo',
                element: scope.settings.element,
                id: response.data,
                label: scope.node[scope.realLabel.labeling],
                labels: scope.node.labels,
                color: scope.realLabel.color,
                source: scope.settings.node[0].id,
                target: scope.settings.node[1].id
              };
              $http.post('/api/data/createEdge/', edge).then(response2 => {
                scope.handler({
                  e: event
                });
              });
            }
          });
        };

        /****** Open detail *********/
        scope.detail = function(id, label) {
          scope.handler({e: {
            type: 'detail',
            element: scope.settings.element,
            node: [{id: id.toString(), label: label}],
            position: {clientY: -1, clientX: -1}
          }});
        };

        scope.reverse = function() {
          let tmp = scope.settings.node[0];
          scope.settings.node[0] = scope.settings.node[1];
          scope.settings.node[1] = tmp;
          scope.node.reverse = !scope.node.reverse;
        };

        scope.addContextPanel = function() {
          angular.element('#contextMenu').remove();
          let menu = document.createElement('context-menu');
          menu.setAttribute('settings', 'contextMenu');
          menu.setAttribute('handler', 'eventHandler(e)');
          menu.setAttribute('id', 'contextMenu');
          angular.element('#contextMenu_container_detail_' + scope.settings.panel_id).append(menu);
          $compile(menu)(scope);
        };

        scope.eventHandler = function(e) {
          switch (e.type) {
            case 'add':
              scope.node[e.key].push({pid: scope.newPid, value: '', attrs: []});
              scope.newPid--;
              break;
            case 'attach':
              angular.element('#contextMenu').remove();
              scope.contextMenu = {
                style: {
                  title: 'Attach attr',
                  display: true,
                  draggable: false,
                  //icon: 'cog',
                  css: 'top: 100px; left : 150px; height: 500px;'
                },
                fields: [{ label: 'Attr id: ', key: e.key, pid: e.pid, aid: '', action: 'attachGo'}]
              };
              scope.addContextPanel();
              break;
            case 'addAttr':
              angular.element('#contextMenu').remove();
              scope.contextMenu = {
                style: {
                  title: 'Add attr',
                  display: true,
                  draggable: false,
                  //icon: 'cog',
                  css: 'top: 100px; left : 150px; height: 500px;'
                },
                fields: [{ label: 'Attr id: ', aid: '', action: 'addAttrGo'}]
              };
              scope.addContextPanel();
              break;
            case 'attachGo':
              let target = false;
              angular.forEach(scope.node[e.key], function (p, i) {
                if (p.pid === e.pid) {
                  target = i;
                }
              });
              if (!scope.node[e.key][target].attrs) {
                scope.node[e.key][target].attrs = [];
              }
              scope.node[e.key][target].attrs.push({aid: e.aid, type: e.element}); // Visual
              scope.node.create.push({pid: e.pid, aid: e.aid, type: e.element}); // For the Api
              break;
            case 'addAttrGo':
              scope.node.addAttrs.push({aid: e.aid, type: e.element});
              if (Object.keys(scope.attributs).indexOf(e.key) === -1) {
                scope.attributs[e.element] = [];
              }
              scope.attributs[e.element].push({id: e.aid, value: [{pid: '', value: e.optionLabel}]});
              break;
            case 'detach':
              let target_p = false;
              let target_a = false;
              angular.forEach(scope.node[e.key], function (p, i) {
                if (p.pid === e.pid) {
                  target_p = i;
                  angular.forEach(scope.node[e.key][target_p].attrs, function (a, index) {
                    if (e.aid === a) {
                      target_a = index;
                    }
                  });
                }
              });
              scope.node[e.key][target_p].attrs.splice(target_a, 1);
              scope.node.delete.push({pid: e.pid, aid: e.aid});
              break;
            case 'remove':
              let t = false;
              angular.forEach(scope.node[e.key], function (p, index) {
                if (p.pid === e.pid) {
                  t = index;
                }
              });
              scope.node[e.key].splice(t, 1);
              scope.node.delete.push({pid: e.pid});
              if (!scope.node[e.key].length) {
                delete scope.node[e.key];
              }
              break;
          }
        };

        scope.openMenu = function(event, key, pid, attrs) {
          let opt = [
            { label: 'Add same', action: 'add', key: key},
            { label: 'Attach attr', action: 'attach', key: key, pid: pid}
          ];
          if (attrs && attrs.length) {
            angular.forEach(attrs, function(a) {
              opt.push({ label: 'Detach ' + a.type + ' ' + a.aid, action: 'detach', key: key, pid: pid, aid: a.aid});
            });
          }
          opt.push({ label: 'Remove property', action: 'remove', key: key, pid: pid});
          scope.contextMenu = {
            style: {
              title: 'Property ' + key,
              display: true,
              draggable: false,
              //icon: 'cog',
              css: 'top: 300px; left : 150px;'
            },
            options: opt
          };
          scope.addContextPanel();
        };

        scope.close = function() {
          scope.handler({e: {
            type: 'close',
            id: scope.settings.id
          }});
          element.remove();
        };

        scope.detachAttr = function (id, label) {
          scope.node.delAttrs.push(id);
          let found = false;
          angular.forEach(scope.attributs[label], function (attr, index) {
            if (attr.id === id) {
              found = index;
            }
          });
          scope.attributs[label].splice(found, 1);
        };

        /****** Load when ready *****/
        $timeout(function () {
          scope.load();
        });
      }
    };
  })
  .name;
