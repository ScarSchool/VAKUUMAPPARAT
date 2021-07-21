const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
	// attributes
	name: {
		type: String,
        required: true,
        unique: true
	},
	useCount: {
        type: Number,
        default: 0,
		required: true
	}
});

let tagModel = mongoose.model('tags', tagSchema);

module.exports = tagModel;