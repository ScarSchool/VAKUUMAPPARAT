
const AppError = require('../errorhandling/error-model');

var ObjectId = require('mongoose').Types.ObjectId;

module.exports.checkUserId = (userId) => {
	if (!userId)
		throw new AppError(500, 'userId not set');

	if (!ObjectId.isValid(userId))
		throw new AppError(400, 'userId not in correct format');
};

module.exports.checkTagId = (tagId) => {
	if (!tagId)
		throw new AppError(500, 'tagId not set');

	if (!ObjectId.isValid(tagId))
		throw new AppError(400, 'tagId not in correct format');
};

module.exports.checkNotificationId = (notificationId) => {
	if (!notificationId)
		throw new AppError(500, 'notificationId not set');

	if (!ObjectId.isValid(notificationId))
		throw new AppError(400, 'notificationId not in correct format');
};

module.exports.createPayloadCheck = (requiredProperties, allowedProperties) => {
	return (resource, type) => {
		let resourceKeys = Object.keys(resource);
		let currentPropNumber = resourceKeys.length;

		let numberOfRequiredProps = type == 'create' ? requiredProperties.length : 1;

		if (currentPropNumber < numberOfRequiredProps || currentPropNumber > allowedProperties.length)
			throw new AppError(400, 'number of properties not correct');

		if (!resourceKeys.every(k => allowedProperties.includes(k)))
			throw new AppError(400, 'unkown property sent');

		if (type == 'create') {
			if (resource._id)
				throw new AppError(400, 'not allowed to send an id. ids are server-generated. not allowed a new entity creation');

			if (!requiredProperties.every(k => resourceKeys.includes(k) && resource[k]))
				throw new AppError(400, 'required property is missing');
		}
	};
};

module.exports.createObjectToDeliver = (obj, propToDeliver) => {
	// fields to deliver:
	let newObj = {};
	propToDeliver.forEach(p => newObj[p] = obj[p]);

	return newObj;
};
