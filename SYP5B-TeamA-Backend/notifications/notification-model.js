const mongoose = require('mongoose');
const Mixed = mongoose.Schema.Types.Mixed;
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	// attributes
	title: {
		type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['success', 'info', 'warning', 'error'],
        default: 'info'
    },
    read: {
        type: Boolean,
        required: true,
        default: false
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
		type: String,
        required: false
    },
    contentReference: {
        type: {
            type: String,
            enum: ['none', 'url', 'demand', 'offeraccepted', 'offerenroll', 'profilereview', 'profilereply', 'profilelike'],
            required: true,
            default: 'none'
        },
        content: {
            type: Mixed,
            required: false,
            default: ''
        }
    },
});

let notificationModel = mongoose.model('notifications', notificationSchema);

module.exports = notificationModel;