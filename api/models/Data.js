/**
* Data.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    id          : { type: 'integer', primaryKey: true, autoIncrement: true },

    objParamId  : { model: 'objparam' },

    date        : { type: 'date' },

    type        : { type: 'string', enum:['plan', 'fact'], defaultsTo: 'fact' },

    val         : { type: 'float' }
  }
};

