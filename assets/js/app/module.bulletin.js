(function () {
  'use strict';

  angular
  .module('app.bulletin', ['textAngular', 'angularFileUpload', 'app.constant', 'app.basin', 'app.chart', 'app.data'])
  .controller('Bulletin', ['$scope', '$rootScope', 'API', 'FileUploader', 'MONTH', 'Chart', 'Basin', 'Data', 'Pdf', 'Analysis', BulletinCtrl])
  .factory('Pdf',['API', '$http', '$q', PdfFactory])
  .factory('Analysis',['API', '$http', '$q', AnalysisFactory])
  ;


  function BulletinCtrl ($scope, $rootScope, API, FileUploader, MONTH, Chart, Basin, Data, Pdf, Analysis) {
    $scope.vm = this;
    $scope.vm.pdf = {};
    $scope.vm.datas = [];
    $scope.vm.picture = '/images/cover.jpg';
    $scope.vm.text = '[двойной клик правой мышью для редактирования текста]';

    $scope.vm.save = save;
    $scope.vm.avg = avg;

    $scope.vm.days = {};
    $scope.vm.period = {};
    $scope.vm.month = {};

    // Calculate number of days for selected and next month
    $rootScope.$watch('selects.date', daysInMonth);

    $rootScope.$watch('selects.date', dateChanged);

    Basin.query().then(function (basins) {
      $scope.vm.basins = angular.copy(basins);
    });

    function daysInMonth (date) {
      $scope.vm.days = {
        first:  Data.daysInMonth(date),
        second: Data.daysInMonth(new Date(date.getFullYear(), date.getMonth() + 1, 1))
      };
      $scope.vm.period = {
        first:  [ 10, 20, $scope.vm.days.first ],
        second: [ 10, 20, $scope.vm.days.second ]
      };
      $scope.vm.month = {
        first:  MONTH[date.getMonth()],
        second: MONTH[date.getMonth() + 1]
      };
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

    // Sending Request for Pdf if selects was changed
    function dateChanged (date) {
      $scope.vm.pdfText         = MONTH[date.getMonth()] +
                                  ' - ' +
                                  MONTH[date.getMonth() == 11 ? 1 : date.getMonth() + 1] +
                                  ' ' +
                                  date.getFullYear() + ' г.';

      $scope.vm.analysisText    = 'Анализ фактической ситуации за ' +
                                MONTH[date.getMonth()].toLowerCase() +
                                ' и прогноз на ' +
                                MONTH[date.getMonth() == 11 ? 1 : date.getMonth() + 1].toLowerCase();


      var queryDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-01';
      Pdf.query({ date: queryDate }).then(function (pdf) {
        $scope.vm.pdf = angular.copy(pdf);
        $scope.vm.pdf.analyzes = parseAnalyzes($scope.vm.pdf.analyzes);
      });
      Pdf.data({ date: date }).then(function (data) {
        $scope.vm.datas = data;
        console.log($scope.vm.datas);
      });
    };

    function save () {

      $scope.vm.pdf.status = 0;
      $scope.vm.pdf.date = new Date($rootScope.selects.date.getFullYear(), $rootScope.selects.date.getMonth(), 1);
      Pdf.update($scope.vm.pdf).then(function (pdf) {
        $scope.vm.pdf.id = pdf.id;
        for (var basin in $scope.vm.pdf.analyzes) {
          $scope.vm.pdf.analyzes[basin].pdfId = pdf.id;
          $scope.vm.pdf.analyzes[basin].basinId = basin;
          if ($scope.vm.pdf.analyzes[basin])
          Analysis.update($scope.vm.pdf.analyzes[basin]).then(function (analysis) {
            $scope.vm.pdf.analyzes[analysis.basinId] = analysis;
          });
        };

      });

    };

    function parseAnalyzes (analyzes) {
      var result = {};
      if (analyzes && analyzes.length > 0) {
        analyzes.map(function (analysis) {
          result[analysis.basinId] = analysis;
        });
      }
      return result;
    };

    var uploader = $scope.vm.uploader = new FileUploader({
      removeAfterUpload: true,
      queueLimit: 1,
      withCredentials: true,
      autoUpload: true,
      url: API.pdf + '/cover'
    });
    uploader.onCompleteItem = function (item, response, status, headers) {
      $scope.vm.pdf.cover = response;
    };

  };

  function PdfFactory (API, $http, $q) {
    var factory = {
      query: query,
      data: data,
      update: update
    };

    return factory;

    function query (params) {
      var defer = $q.defer();
      $http.get(API.pdf, {params:params}).then(function(res) {
        defer.resolve(res.data);
      });
      return defer.promise;
    };

    function data (params) {
      var defer = $q.defer();
      $http.get(API.pdf + '/data', {params:params}).then(function(res) {
        defer.resolve(res.data);
      });
      return defer.promise;
    };

    function update (pdf) {
      var data = angular.copy(pdf);
      delete data.analyzes;
      if (!data) return false;

      var defer = $q.defer();
      if (pdf.id) $http.put(API.pdf + '/' + data.id, data).then(function(res) {
        defer.resolve(res.data);
      });
      else $http.post(API.pdf, data).then(function(res) {
        defer.resolve(res.data);
      });
      return defer.promise;
    };
  };

  function AnalysisFactory (API, $http, $q) {
    var factory = {
      query: query,
      update: update
    };

    return factory;

    function query (params) {
      var defer = $q.defer();
      $http.get(API.analysis, {params:params}).then(function(res) {
        defer.resolve(res.data);
      });
      return defer.promise;
    };

    function update (analysis) {
      if (!analysis) return false;
      
      var defer = $q.defer();
      
      var next = function (res) {
        defer.resolve(res.data);
      };

      if (analysis.id) $http.put(API.analysis + '/' + analysis.id, analysis).then(next);
      else $http.post(API.analysis, analysis).then(next);
      return defer.promise;
    };
  };

})();