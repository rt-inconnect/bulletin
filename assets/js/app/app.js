(function () {
  'use strict';

  var app = angular.module('app', [
    'ngSanitize',
    'ngAnimate',
    'mgcrea.ngStrap',
    
    'app.constant',
    'app.config',

    'app.data',
    'app.bulletin',
    'app.export',
    'app.category',
    'app.basin'

  ]);
})();