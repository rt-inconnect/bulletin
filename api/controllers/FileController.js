/**
 * FileController
 *
 * @description :: Server-side logic for managing Filecontrollers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  get: function (req, res) {
    res.sendfile(req.path.substr(1));
  }	
};

