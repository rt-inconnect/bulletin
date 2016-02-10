/**
 * PdfController
 *
 * @description :: Server-side logic for managing pdfs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var phantom = require('phantom');

module.exports = {

  find: function (req, res) {
    var date = req.param('date');
    Pdf.findOne({date:date})
      .populate('analyzes')
      .exec(function (err, pdf) {
        if (err) sails.log.error('PdfController.js:find', 'Pdf.findOne', date, err);
        if (_.isEmpty(pdf)) return res.json({});
        res.json(pdf);
      });
  },

  cover: function (req, res) {
    if (req.file('file')._files[0]) {
      var uid = Math.round((new Date()).getTime() / 1000);
      var filename = 'cover_'+ uid;
      var dirname = '/public/covers/';
      req.file('file').upload({
        dirname: '../..' + dirname,
        saveAs: filename,
        maxBytes: 100000000
      }, function (err, files) {
        if (err) return res.serverError(err);
        res.send(dirname + filename);
      });
    } else {
      res.send(404);
    }
  },  

  data: function (req, res) {
    var date = H.toDATE(req.param('date'));

    var criteria = {
      date: { 
        '>=': H.firstDAY(date),
        '<': H.firstDAY(date, 2)
      }
    };

    async.waterfall([

      function (callback) {
        Basin.find().exec(function (err, basins) {
          callback(err, basins);
        });
      },

      function (basins, callback) {
        Category.find().exec(function (err, categories) {
          callback(err, basins, categories);
        });
      },

      function (basins, categories, callback) {
        Obj.find().exec(function (err, objs) {
          callback(err, basins, categories, objs);
        });
      },

      function (basins, categories, objs, callback) {
        ObjParam.find()
          .populate('paramId')
          .populate('datas', criteria)
          .exec(function (err, params) {
            objs = H.hierarchy(objs, H.paramsAVG(params, date), 'objId', 'params', H.objCOLSPANS);
            categories = H.hierarchy(categories, objs, 'categoryId', 'objs');
            callback(err, categories);
          });



      }

    ],
    function (err, results) {
      if (err) sails.log.error('PdfController.js:data', err);
      res.json(results);
    });
  },

  phantom: function (req, res) {
    phantom.create(function (ph) {
      ph.createPage(function (page) {
        page.set('paperSize', {
          width: '210mm',
          height: '297mm'
        }, function() {
          page.open("http://localhost:1337/pdf?date=2015-07-04T08:40:39.059Z", function (status) {
            console.log('Status is', status);
            setTimeout(function() {
              page.render('file.pdf', function () {
                console.log('saved!');
                ph.exit();
                res.send('OK!');
              });
            }, 5000);
          });
        });        
      });
    },{
      dnodeOpts: {
        weak: false
      }
    });
  }

};

