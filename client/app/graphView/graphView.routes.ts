'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('graphView', {
      url: '/graphView',
      template: '<graph-view></graph-view>',
      authenticate: 'user'
    });
}
