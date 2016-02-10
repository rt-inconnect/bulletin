(function () {
  'use strict';

  angular
  .module('app.chart', ['highcharts-ng', 'app.constant'])
  .factory('Chart', ['MONTH', ChartFactory])
  .controller('ChartCtrl', ['$scope', 'Chart', ChartCtrl])  
  .directive('chartDirective', [chartDirective]);

  function ChartFactory (MONTH) {

    var factory = {
      render: render
    };

    return factory;

    function render (objs, days, date, basin) {
      var results = {};
      objs.map(function (obj) {

        if (basin && basin != obj.basinId) return false;

        obj.params.map(function (param) {
          if (!results['param' + param.paramId.id]) {
            results['param' + param.paramId.id] = {
              id          : param.paramId.id,
              name        : param.paramId.name,
              measure     : param.paramId.measure,
              withTypes   : param.paramId.withTypes,
              first       : getOptions(MONTH[date.getMonth()],     param.paramId.name + ', ' + param.paramId.measure, days.first,  false),
              second      : getOptions(MONTH[date.getMonth() + 1], param.paramId.name + ', ' + param.paramId.measure, days.second, true )
            };
          }

          var result = results['param' + param.paramId.id];
          getData(result, obj, param, days, 'first');
          getData(result, obj, param, days, 'second');
        });
      });
      return results;
    };

    function getData (result, obj, param, days, part) {
      var fact = createSeries(obj.name + ' - факт');
      if (result.withTypes) var plan = createSeries(obj.name + ' - план');

      for (var d = 1; d < days[part]; d++) {
        var values = getValues(param.avg[part], d);
        fact.data.push(values.fact || 0);
        if (result.withTypes) plan.data.push(values.plan || '');
      };

      result[part].series.push(fact);
      if (result.withTypes) result[part].series.push(plan);
    };

    function getValues (param, day) {
      var result = {};
      if (param.fact && param.fact[getIndexByDay(param.fact, day)]) result.fact = param.fact[getIndexByDay(param.fact, day)].val || '';
      if (param.plan && param.plan[getIndexByDay(param.plan, day)]) result.plan = param.plan[getIndexByDay(param.plan, day)].val || '';
      return result;
    };

    function createSeries (name) {
      return {
        name: name,
        marker: { enabled: false },
        data: []
      };
    };

    function getOptions (title, yAxis, days, opposite) {
      return {
        title: { text: title },
        yAxis: { title: { text: yAxis }, opposite: opposite },
        xAxis: { categories: getXAxis(days) },
        series: []
      };
    };

    function getXAxis (days) {
      var result = [];
      for (var d = 1; d < days; d++) {
        //result.push((d < 10 ? '0' + d : d ) + '.' + (date.getMonth() + 1));
        result.push(d);
      };
      return result;
    };

    function getIndexByDay (param, day) {
      return param.map(function(o) { return new Date(Date.parse(o.date)).getDate() }).indexOf(day);
    };
  };


  function ChartCtrl ($scope, Chart) {
    $scope.vm = this;
    $scope.vm.params = Chart.render($scope.objs, $scope.days, $scope.date, $scope.basin);
  };

  function chartDirective () {
    var directive = {
      restrict: 'E',
      scope: {
        date:  '=',
        objs:  '=',
        days:  '=',
        basin: '='
      },
      templateUrl: 'templates/chart/list.html',
      controller: "ChartCtrl",
      controllerAs: "chart"
    };

    return directive;
  };

})();