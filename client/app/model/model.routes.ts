'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('model', {
      url: '/model',
      template: '<model></model>',
      authenticate: 'user'
    });
}
