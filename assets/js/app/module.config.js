(function () {
  'use strict';

  angular
  .module('app.config', [])
  .config([config])
  .run(['$rootScope', run]);

  function config () {

  };

  function run ($rootScope) {
    $rootScope.selects = {
      category: 1,
      basin: 1,
      date: date || new Date()
    };
  };


})();