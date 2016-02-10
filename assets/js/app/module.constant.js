(function () {
  'use strict';

  angular
  .module('app.constant', [])
  .constant('API', API())
  .constant('PARAMS', PARAMS())
  .constant('MONTH', MONTH());

  function API () {
    return {
      
      data      : '/api/data',
      basin     : '/api/basin',
      category  : '/api/category',

      analysis  : '/api/analysis',
      pdf       : '/api/pdf'
    };
  };

  function PARAMS () {
    return {
      siteName: 'Bulletin'
    };
  };

  function MONTH () {
    return [
      'Январь',     'Февраль',    'Март',
      'Апрель',     'Май',        'Июнь',
      'Июль',       'Август',     'Сентябрь',
      'Октябрь',    'Ноябрь',     'Декабрь'
    ];
  };

})();