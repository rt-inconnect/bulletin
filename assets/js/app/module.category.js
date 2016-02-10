(function () {
  'use strict';

  angular
  .module('app.category', ['app.constant'])
  .controller('CategoryCtrl', ['$scope', '$rootScope', 'Category', CategoryCtrl])
  .factory('Category',['API', '$http', '$q', CategoryFactory])
  .directive('categoryList', [categoryListDirective]);

  function CategoryCtrl ($scope, $rootScope, Category) {
    $scope.vm = this;

    $scope.vm.selects = $rootScope.selects;
    
    Category.query().then(function (data) {
      $scope.vm.data = data;
    });

    $scope.vm.changeCurrent = function (rec) {
      $rootScope.selects.category = rec.id;
    };
  };

  function CategoryFactory (API, $http, $q) {
    var factory = {
      query: query
    };

    return factory;

    function query (params) {
      var defer = $q.defer();
      $http.get(API.category, {params:params}).then(function(res) {
        defer.resolve(res.data);
      });
      return defer.promise;
    };
  };

  function categoryListDirective () {
    var directive = {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/category/list.html',
      controller: "CategoryCtrl",
      controllerAs: "category"
    };

    return directive;
  };

})();