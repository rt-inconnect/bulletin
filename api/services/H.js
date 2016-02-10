/**
* H.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  hierarchy: function (parent, childs, by, name, beforePush) {
    _.forEach(childs, function (child) {
      var index = _.map(parent, 'id').indexOf(child[by]);
      if (_.isEmpty(parent[index][name])) parent[index][name] = [];
      if (typeof beforePush == 'function') parent[index] = beforePush(parent[index], child);
      parent[index][name].push(child);
    });
    return parent;
  },

  toDATE: function (date) {
    return new Date(Date.parse(date));
  },

  firstDAY: function (date, incMONTH) {
    if (!incMONTH) incMONTH = 0;
    return new Date(date.getFullYear(), date.getMonth() + incMONTH, 1);
  },

  paramsAVG: function (params, date) {
    var types = {
      plan: [],
      fact: []
    };

    var avg = {
      first: types,
      second: types
    };

    var filter = {};
    filter[date.getMonth()]     = 'first';
    filter[date.getMonth() + 1] = 'second';

    _.forEach(params, function (param) {
      param.avg = avg;
      var datas = _.groupBy(param.datas, function (data) {
        return filter[data.date.getMonth()];
      });
      datas.first = _.groupBy(datas.first, 'type');
      datas.second = _.groupBy(datas.second, 'type');
      param.avg = datas;
      param.datas = [];
    });


    return params;    
  },

  objCOLSPANS: function (obj, param) {
    if (!obj.rowspan) obj.rowspan = 0;
    obj.rowspan += 1;
    if (param.paramId.withTypes) obj.rowspan += 1;
    return obj;
  }
};

