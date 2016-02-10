/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	find: function (req, res) {

    var date = H.toDATE(req.param('date'));

    var dataCriteria = {
      date: { 
        '>=': H.firstDAY(date),
        '<': H.firstDAY(date, 1)
      }
    };

    var objCriteria = {
      basinId     : parseInt(req.param('basin')),
      categoryId  : parseInt(req.param('category'))
    };

    async.waterfall([

      function (callback) {
        Obj.find(objCriteria).exec(function (err, objs) {
          callback(err, objs);
        });
      },

      function (objs, callback) {
        if (_.isEmpty(objs)) return callback(false, []);
        
        ObjParam.find({objId: _.map(objs, 'id')})
          .populate('paramId')
          .populate('objId')
          .populate('datas', dataCriteria)
          .exec(function (err, params) {
            callback(err, params);
          });
      },

    ],
    function (err, results) {
      if (err) sails.log.error('DataController.js:find', err);
      res.json(results);
    });

  },

  export: function (req, res) {
    
    var date = H.toDATE(req.param('date'));

    var dataCriteria = {
      date: { 
        '>=': H.firstDAY(date),
        '<': H.firstDAY(date, 2)
      }
    };

    var objCriteria = {
      basinId     : parseInt(req.param('basin')),
      categoryId  : parseInt(req.param('category'))
    };


    async.waterfall([

      function (callback) {
        Obj.find(objCriteria).exec(function (err, objs) {
          callback(err, objs);
        });
      },

      function (objs, callback) {
        if (_.isEmpty(objs)) return callback(false, []);
        
        ObjParam.find({objId: _.map(objs, 'id')})
          .populate('paramId')
          .populate('datas', dataCriteria)
          .exec(function (err, params) {
            objs = H.hierarchy(objs, H.paramsAVG(params, date), 'objId', 'params', H.objCOLSPANS);
            callback(err, objs);
          });
      },

    ],
    function (err, results) {
      if (err) sails.log.error('DataController.js:export', err);
      res.json(results);
    });
  }
};

