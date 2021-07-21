const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema;
const enrollmentSchema = require('./../enrollments/enrollment-model').schema;

const offerSchema = new Schema({
	// attributes
  title: {
		type: String,
		required: true
    },
    description: {
		type: String,
		required: true
	},
  tags: [{
    type: String,
    required: false
  }],
	createdBy: {
		type: ObjectId,
    required: true
	},
	attendees: {
    type: Array,
    required: false,
    default: []
  },
  enrollingAttendees: [{
    type: enrollmentSchema,
    required: false,
    default: []
  }],
  minAttendees: {
		type: Number,
    required: true,
    default: 1
  },
  maxAttendees: {
    type: Number,
    required: true,
    default: 1
  },
  requirements: {
    type: Array,
    required: false,
    default: []
  }
});

let offerModel = mongoose.model('offers', offerSchema);

module.exports = offerModel;