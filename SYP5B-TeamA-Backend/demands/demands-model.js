const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema;

const demandSchema = new Schema({
	// attributes
    userId: {
		type: ObjectId,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now 
	}
});

let demandModel = mongoose.model('demands', demandSchema);

module.exports = demandModel;