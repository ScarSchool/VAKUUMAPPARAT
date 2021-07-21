const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	// attributes
    title: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: true,
        max: 5,
        min: 1
    },
    authorId: {
        type: ObjectId,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now()
    },
    edited: {
        type: Boolean,
        required: true,
        default: false
    },
    answers: [{
        authorId: {
        type: ObjectId,
        required: true
        },
        content: {
            type: String,
            require: true,
            default: ''
        },
        edited: {
            type: Boolean,
            require: true,
            default: false
        },
        timestamp: {
            type: Date,
            require: true,
            default: Date.now
        }
    }]
});

let reviewModel = mongoose.model('reviews', reviewSchema);

module.exports = reviewModel;
