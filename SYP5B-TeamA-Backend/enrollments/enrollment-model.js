const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema({
	// attributes
    userId: {
		type: ObjectId,
        required: true
    },
    description: {
		type: String,
		maxlength: 260,
		required: false,
		default: ''
	}
});

let enrollmentModel = mongoose.model('enrollments', enrollmentSchema);

module.exports = enrollmentModel;