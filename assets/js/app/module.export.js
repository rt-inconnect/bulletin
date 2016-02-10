(function () {
  'use strict';

  angular
  .module('app.export', ['app.constant', 'app.chart', 'app.data'])
  .controller('Export', ['$scope', 'API', 'MONTH', 'Chart', 'Data', ExportCtrl])
  ;


  function ExportCtrl ($scope, API, MONTH, Chart, Data) {
    $scope.vm = this;
    $scope.vm.objs = [];

    $scope.vm.days = {};
    $scope.vm.period = {};
    $scope.vm.avg = avg;
    $scope.vm.month = {
      first:  MONTH[date.getMonth()],
      second: MONTH[date.getMonth() + 1]
    };

    daysInMonth();

    var params = {
      category: category,
      basin   : basin,
      date    : date
    };

    Data.query(params, '/export').then(function (data) {
      $scope.vm.objs   = angular.copy(data);
      $scope.vm.params = Chart.render(angular.copy(data), $scope.vm.days, date);
    });

    function daysInMonth () {
      $scope.vm.days.first = Data.daysInMonth(date);
      $scope.vm.period.first = [ 10, 20, $scope.vm.days.first ];
      $scope.vm.days.second = Data.daysInMonth(new Date(date.getFullYear(), date.getMonth() + 1, 1));
      $scope.vm.period.second = [ 10, 20, $scope.vm.days.second ];
    };

    function avg (which, datas, period) {

      if (!datas) return '';

      var result = 0;
      var qty = 0;
      var start = $scope.vm.period[which][period - 1] || 0;
      var end = $scope.vm.period[which][period];

      datas.map(function (data) {
        var day = new Date(Date.parse(data.date)).getDate();
        if (day > start && day <= end) {
          result += data.val;
          qty += 1;
        }
      });
      if (result && qty) return (result / qty).toFixed(2);
      return '';
    };

  };

})();