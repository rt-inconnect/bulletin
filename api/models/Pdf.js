/**
* Pdf.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    id          : { type: 'integer', primaryKey: true, autoIncrement: true },

    date        : { type: 'date' },

    cover       : { type: 'string' },

    status      : { type: 'integer', enum: [0, 1] },

    analyzes    : { collection: 'analysis', via: 'pdfId' }

  }
};

