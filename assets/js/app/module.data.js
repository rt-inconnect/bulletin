(function () {
  'use strict';

  angular
  .module('app.data', ['app.constant'])
  .controller('App', ['$scope', '$rootScope', 'Data', AppCtrl])
  .factory('Data',['API', '$http', '$q', DataFactory])
  .filter('range', RangeFilter);


  function AppCtrl ($scope, $rootScope, Data) {
    $scope.vm = this;
    $scope.vm.opened = true;
    $scope.vm.days = 0;
    $scope.vm.period = {
      days: [ 10, 20, 30 ],
      colspan: [12, 12, 12],
      names: ['I декада', 'II декада', 'III декада'],
      isEnd: isPeriodEnd,
      calc: periodCalc
    };
    $scope.vm.loading = true;

    $scope.vm.editData = editData;
    $scope.vm.report = report;
    $scope.vm.selects = {
      obj: {},
      param: {}
    };

    // Calculate number of days for a selected month
    $rootScope.$watch('selects.date', daysInMonth);

    $rootScope.$watch('selects.category', selectsChanged);
    $rootScope.$watch('selects.basin', selectsChanged);
    $rootScope.$watch('selects.date', selectsChanged);

    // Generate array of periods for a selected month
    $scope.$watch('vm.days', periodPoints);

    // Sending Request for Data if selects was changed
    function selectsChanged () {
      var params = {
        category: $rootScope.selects.category,
        basin   : $rootScope.selects.basin,
        date    : $rootScope.selects.date
      };

      if (!Data.loading) {
        $scope.vm.loading = true;
        Data.query(params).then(function (data) {
          $scope.vm.data = angular.copy(parseData(data));
          $scope.vm.loading = false;
        });
      }
    };

    function daysInMonth (date) {
      $scope.vm.days = Data.daysInMonth(date);
    };

    function periodPoints (days) {
      $scope.vm.period.days    = [ 10, 20, days ];
      $scope.vm.period.colspan = [ 12, 12, (days - 20) + 2 ];
    };

    function isPeriodEnd (day) {
      if ($scope.vm.period.days.indexOf(day) >= 0) {
        return true;
      }
      return false;
    };

    function periodCalc (operation, end, datas, type) {
      var result = 0;
      var index = $scope.vm.period.days.indexOf(end);
      var start = ($scope.vm.period.days[index - 1] || 0) + 1;
      for (var i = start; i <= end; i++) {
        var data = datas['day' + i];
        if( data && data[type] ) result += data[type].val;
      };

      if (result && operation == 'avg') result = result / ((end - start) + 1);
      return result.toFixed(2);
    };

    function parseData (data) {
      var result = {};

      data.map(function (o) {
        var datas  = {};

        var oKey = 'obj' + o.objId.id;
        var pKey = 'param' + o.paramId.id;

        if (!result[oKey])        result[oKey] = o.objId;
        if (!result[oKey].params) result[oKey].params = {};

        o.datas.map(function (d) {
          var dKey = new Date(Date.parse(d.date)).getDate();
          if (!datas['day' + dKey]) datas['day' + dKey] = {};
          datas['day' + dKey][d.type] = d;
        });

        result[oKey].params[pKey] = o.paramId;
        result[oKey].params[pKey].datas = datas;
        result[oKey].params[pKey].objParamId = o.id;
      });
      return result;
    };

    function editData (param, day, type) {
      var cell = param.datas['day' + day];
      if (!cell) cell = {};
      if (!cell[type]) cell[type] = {};
      var data = parseFloat(
        prompt(
          'День ' + day + ' - ' + param.name + '(' + param.measure + ')',
          cell[type].val
        )
      );

      if (!Number.isNaN(data)) {
        var date = $rootScope.selects.date;
        cell[type] = {
          id: cell[type].id,
          type: type,
          objParamId: param.objParamId,
          date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + day,
          val: parseFloat(data.toFixed(2))
        };
        Data.update(cell[type]).then(function (data) {
          cell[type] = data;
          param.datas['day' + day] = cell;
        });
      }

    };

    function report () {
      var w = 850;
      var h = 750;
      var left = (screen.width/2)-(w/2);
      var top = (screen.height/2)-(h/2);
      var params = '?basin=' + $rootScope.selects.basin + '&category=' + $rootScope.selects.category + '&date=' + $rootScope.selects.date;

      var win = window.open("/export" + params, "win", 'width='+w+', height='+h+', top='+top+', left='+left);
      win.focus();
    };

  };

  function DataFactory (API, $http, $q) {
    var factory = {
      loading: false,
      query: query,
      update: update,
      daysInMonth: daysInMonth
    };

    return factory;

    function daysInMonth (date) {
      var start = angular.copy(new Date(date.getFullYear(), date.getMonth(), 1));
      var end   = angular.copy(new Date(date.getFullYear(), date.getMonth() + 1, 1));
      return angular.copy((end - start) / (1000 * 60 * 60 * 24));
    };

    function query (params, customACTION) {
      if (factory.loading) return false;
      factory.loading = true;
      if (!customACTION) customACTION = '';
      var defer = $q.defer();
      $http.get(API.data + customACTION, {params:params}).then(function(res) {
        factory.loading = false;
        defer.resolve(res.data);
      });
      return defer.promise;
    };

    function update (data) {
      if (!data) return false;

      var defer = $q.defer();
      if (data.id) $http.put(API.data + '/' + data.id, data).then(function(res) {
        defer.resolve(res.data);
      });
      else $http.post(API.data, data).then(function(res) {
        defer.resolve(res.data);
      });
      return defer.promise;
    };
  };

  function RangeFilter () {
    return function (input, total) {
      total = parseInt(total);
      for (var i = 0; i < total; i++) input.push(i+1);
      return input;
    };
  };

})();