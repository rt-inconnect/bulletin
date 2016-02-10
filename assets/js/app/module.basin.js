(function () {
  'use strict';

  angular
  .module('app.basin', ['app.constant'])
  .controller('BasinCtrl', ['$scope', '$rootScope', 'Basin', BasinCtrl])
  .factory('Basin',['API', '$http', '$q', BasinFactory])
  .directive('basinList', [basinListDirective]);

  function BasinCtrl ($scope, $rootScope, Basin) {
    $scope.vm = this;

    $scope.vm.selects = $rootScope.selects;
    
    Basin.query().then(function (data) {
      $scope.vm.data = data;
    });

    $scope.vm.changeCurrent = function (rec) {
      $rootScope.selects.basin = rec.id;
    };
  };

  function BasinFactory (API, $http, $q) {
    var factory = {
      query: query
    };

    return factory;

    function query (params) {
      var defer = $q.defer();
      $http.get(API.basin, {params:params}).then(function(res) {
        defer.resolve(res.data);
      });
      return defer.promise;
    };
  };

  function basinListDirective () {
    var directive = {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/basin/list.html',
      controller: "BasinCtrl",
      controllerAs: "basin"
    };

    return directive;
  };

})();