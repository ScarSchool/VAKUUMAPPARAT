const AppError = require('../errorhandling/error-model');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports.checkId = (req, res, next) => {
	let id = req.params.id;
	if (!id || !ObjectId.isValid(id))
		throw new AppError(404, `resource with id ${id} not found`);

	// if there is a payload - and an id in the payload 
	// id in url and id in payload must be equal
	if (req.method == 'PATCH' && req.body && req.body._id) {
		if (!ObjectId.isValid(req.body._id))
			throw new AppError(400, `id in payload is not a number: ${req.body._id}`);

		if (id != req.body.id)
			throw new AppError(400, `id in url "${id}" not equal to id in payload "${req.body._id}"`);
	}

	next();
};

module.exports.getPlainQueryString = (req) => {
	let parts = req.originalUrl.split('?');
	return parts.length <= 1 ? null : parts[parts.length - 1];
};

module.exports.hasQueryString = (req) => {
	return req && req.query && Object.keys(req.query).length > 0;
};

module.exports.checkQueryString = (qs, regEx) => {
	if (!qs.match(regEx)) {
		throw new AppError(400, 'query string not correct');
	}
};