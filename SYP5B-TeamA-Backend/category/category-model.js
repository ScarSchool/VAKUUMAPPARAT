const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const offerSchema = require('./../offers/offer-model').schema;
const demandsSchema = require('./../demands/demands-model').schema;

const categorySchema = new Schema({
  // attributes
  name: {
    type: String,
    required: true,
    unique: true,
  },
  index: {
    type: Number,
    required: true,
    default: -1
  },
  offers: [{
    type: offerSchema
  }],
  reportedDemands: [{
    type: demandsSchema,
    required: false,
    default: []
  }]
});

let categoryModel = mongoose.model('categories', categorySchema);

module.exports = categoryModel;
