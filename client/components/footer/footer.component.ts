const angular = require('angular');

export class FooterComponent {}

export default angular.module('directives.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    replace: true,
    controller: FooterComponent
  })
  .name;
