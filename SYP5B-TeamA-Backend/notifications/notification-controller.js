const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const longpoll = require('express-longpoll')(router);
const AppError = require('../errorhandling/error-model');
const Notification = require('./notification-model');

const { checkNotificationId, createPayloadCheck, createObjectToDeliver } = require('../commons/controller-helpers');

const requiredProperties = ['title'];
// id allowed at updates
// if id is sent with a create / post request, an exception will be fired
const allowedProperties = ['title', 'type','read', 'description', 'contentReference'];
const deliveredProperties = ['_id', 'title', 'type', 'read', 'timestamp', 'description', 'contentReference'];
const checkPayloadProps = createPayloadCheck(requiredProperties, allowedProperties);

const notificationCtrl = {
	publish,
	create: async (user, notification) => {
		try {
			checkUser(user);
			checkPayloadProps(notification, 'create');
			user.notifications.push(notification);
			let savedUser = await user.save();
			let result = savedUser.notifications.pop().toObject();
			let time = result.timestamp.getTime();
			delete result.timestamp;
			result.timestamp = time;
			publish(user.id, result);
			return result;
		} catch (e) {
			throw new AppError(e);
		}
	},
	findById,
    findByUser,
	update: async (user, notificationId, newValues) => {
		try {
			checkUser(user);
			let currentNotification = findById(user, notificationId);
			if (!currentNotification)
				throw new AppError(404, 'Notification not found');
			
			checkPayloadProps(newValues, 'update');
			for (let key in newValues) {
				currentNotification[key] = newValues[key];
			}
			
			await user.save();
			return currentNotification;
		} catch (e) {
			throw new AppError(e);
		}
	},

	delete: async (user, notificationId) => {
		checkUser(user);
		let index = user.notifications.findIndex((x) => x.id.toString() === notificationId);
		if (index < 0)
			throw new AppError(404, 'Notification not found');
		user.notifications.splice(index, 1);
		await user.save();
	},

	deleteAll: async (user) => {
		checkUser(user);
		user.notifications = [];
		await user.save();
	},
	getUnreadCount,
	readAll,
	createNotificationsToDeliver,
	createNodeObject
};

function publish(userId, notification) {
	longpoll.publishToId('/:id/notifications/poll', userId, createNotificationsToDeliver(notification));
}

function findById(user, notificationId) {
	try {
		checkNotificationId(notificationId);
		return user.notifications.find(x => x.id.toString() === notificationId);
	} catch (e) {
		throw new AppError(e);
	}
}

function findByUser(user, count, onlyUnread) {
	try {
		let result = undefined;
		onlyUnread = onlyUnread == 'true' || onlyUnread == true ? true : false;
		checkUser(user);
		let notificationsLength = user.notifications.length;
		if (!count)
			count = notificationsLength;
		if (isNaN(count))
			throw new AppError(400, 'Count must be a number');
		if (onlyUnread === true) {
			result = user.notifications.filter(x => x.read == false).slice(Math.max(notificationsLength - count, 0));
		} else {
			result = user.notifications.slice(Math.max(notificationsLength - count, 0));
		}
		return result;
	} catch (e) {
		throw new AppError(e);
	}
}

async function getUnreadCount(user) {
	let result = 0;
	result = await user.notifications.filter(x => x.read == false).length;
	return result;
}

async function readAll(user) {
	user.notifications.forEach(notification => {
		notification.read = true;
	});
	await user.save();
}

function checkUser(user) {
	if (!user)
		throw new AppError(404, 'User not found');
}

function createNotificationsToDeliver(notifications) {
	let result;
	if (Array.isArray(notifications)) {
		let notificationsToDeliver = [];
		let unreadCount = 0;
		notifications.forEach((notification) => {
			if (notification.prototype instanceof mongoose.Model)
				notification = notification.toObject();
			if (isNaN(notification.timestamp)) {
				let time = notification.timestamp.getTime();
				delete notification.timestamp;
				notification.timestamp = time;
			}
			if (!notification.read)
				unreadCount++;
			notificationsToDeliver.push(createObjectToDeliver(notification, deliveredProperties));
		});
		result = notificationsToDeliver;
		result = {
			unread: unreadCount,
			notifications: result
		};
	} else {
		if (notifications.prototype instanceof mongoose.Model)
			notifications = notifications.toObject();
		if (isNaN(notifications.timestamp)) {
			let time = notifications.timestamp.getTime();
			delete notifications.timestamp;
			notifications.timestamp = time;
		}
		result = createObjectToDeliver(notifications, deliveredProperties);
	}
	return result;
}

function createNodeObject(title, type, description, contentReferenceType, contentReferenceContent) {
	let result = new Notification({title: title});
	if (type)
		result.type = type;
	if (description)
		result.description = description;
	if (contentReferenceType)
		result.contentReference.type = contentReferenceType;
	if (contentReferenceContent)
		result.contentReference.content = contentReferenceContent;
	result = result.toObject();
	delete result._id;
	delete result.timestamp;
	return result;
}

module.exports = notificationCtrl;