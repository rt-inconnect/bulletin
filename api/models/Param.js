/**
* Param.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    id          : { type: 'integer', primaryKey: true, autoIncrement: true },

    categoryId  : { model: 'category' },

    name        : { type: 'string' },

    measure     : { type: 'string' },

    withTypes   : { type: 'integer' },

    calc        : { type: 'integer', defaultsTo: 0 },

    calcFns     : { type: 'array' }
  }
};

