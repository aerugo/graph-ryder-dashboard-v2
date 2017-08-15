'use strict';
const angular = require('angular');
// import ngAnimate from 'angular-animate';
const ngCookies = require('angular-cookies');
const ngResource = require('angular-resource');
const ngSanitize = require('angular-sanitize');

import 'angular-socket-io';

const uiRouter = require('angular-ui-router');
const uiBootstrap = require('angular-ui-bootstrap');
import 'angular-validation-match';



import {routeConfig} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import sigma from '../components/sigma/sigma.directive';
import detailPanel from '../components/panels/detail-panel/detail-panel.directive';
import sigmaPanel from '../components/panels/sigma-panel/sigma-panel.directive';
import settingPanel from '../components/panels/setting-panel/setting-panel.directive';
import contextMenu from '../components/contextMenu/contextMenu.directive';
import main from './main/main.component';
import graphView from './graphView/graphView.component';
import ModelComponent from './model/model.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';


import './app.scss';

angular.module('graphRyderDashboardApp', [
  ngCookies,
  ngResource,
  ngSanitize,

  'btford.socket-io',

  uiRouter,
  uiBootstrap,

  _Auth,
  account,
  admin,
  'validation.match',
    navbar,
  footer,
  sigma,
  detailPanel,
  sigmaPanel,
  settingPanel,
  contextMenu,
  main,
  graphView,
  ModelComponent,
  constants,
  socket,
  util
])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular
  .element(document)
  .ready(() => {
    angular.bootstrap(document, ['graphRyderDashboardApp'], {
      strictDi: true
    });
  });
