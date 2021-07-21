const crypto = require('crypto');
const User = require('./user-model');
const AppError = require('../errorhandling/error-model');
const notificationCtrl = require('../notifications/notification-controller');
const reviewController = require('../reviews/review-controller');

const { checkUserId, createPayloadCheck, createObjectToDeliver } = require('../commons/controller-helpers');

const requiredProperties = ['username', 'password'];
// id allowed at updates
// if id is sent with a create / post request, an exception will be fired
const allowedProperties = ['_id', 'username', 'password', 'firstname', 'lastname', 'state', 'generalInfo', 'privateInfo', 'additionalInfo', 'statistics'];
const deliveredProperties = ['_id', 'username', 'firstname', 'lastname', 'state', 'generalInfo', 'privateInfo', 'additionalInfo', 'statistics'];
const profileProperties = ['_id', 'username', 'firstname', 'lastname', 'state', 'generalInfo', 'privateInfo', 'additionalInfo', 'statistics', 'reviews'];
const dashBoardInfoProperties = ['students', 'teachers', 'offersEnrolledIn', 'createdOffers', 'offersAttendeeIn'];
const checkPayloadProps = createPayloadCheck(requiredProperties, allowedProperties);

const userCtrl = {
	deliveredProperties,
	create: async (user) => {
		try {
			checkPayloadProps(user, 'create');

			let userWithSameName = await findByName(user.username, ['_id', 'username']);
			if (userWithSameName != null)
				throw new AppError(400, `Username '${user.username}' already exists.`);

			let createdUser = null;
			hashPassword(user);
			createdUser = await User.create(user);
			//createdUser.password = undefined;
			return createUsersToDeliver(createdUser, createdUser);
		} catch (e) {
			throw new AppError(e);
		}
	},

	findAll: async (selectionfields) => {
		if (!selectionfields)
			selectionfields = [];
		return await User.find({}, selectionfields.join(' ')).exec();
	},

	findById,

	findByName,

	findByState: async (stateToCheck, selectionfields) => {
		try {
			if (!selectionfields)
				selectionfields = [];
			let selectedUsers = User.find(
				{
					state: stateToCheck
				},
				selectionfields.join(' ')
			).sort('username').exec();
			return selectedUsers;
		} catch (e) {
			throw new AppError(e);
		}
	},

	findByCredentials: async (creds, selectionfields) => {
		try {
			if (!selectionfields)
				selectionfields = [];
			let selectedUsers = User.findOne(
				{
					username: creds.username,
					password: creds.password
				},
				selectionfields.join(' ')
			).exec();
			return selectedUsers;
		} catch (e) {
			throw new AppError(e);
		}
	},

	update: async (id, newValues, authUser) => {
		try {
			let currentUser = await findById(id);
			if (currentUser == null)
				throw new AppError(404, 'User not found');
			if (currentUser.id.toString() !== authUser.id.toString())
				throw new AppError(401, 'Unauthorized.');
			
			checkPayloadProps(newValues, 'update');

			if (newValues.password)
				hashPassword(newValues);
			
			checkInfoFields(newValues);
			for (let key in newValues) {
				currentUser[key] = newValues[key];
			}
			
			await currentUser.save();
			currentUser.password = undefined;
			return currentUser;
		} catch (e) {
			throw new AppError(e);
		}
	},

	delete: async (id) => {
		try {
			//checkUserId(id);
			let currentUser = await findById(id);
			if (currentUser == null)
				throw new AppError(404, 'User not found');
			return currentUser.remove();
		} catch (e) {
			throw new AppError(e);
		}
	},

	// Notification
	getNotificationsByUser: async (userId, count, onlyUnread) => {
		let user = await findById(userId, ['_id', 'username', 'notifications']);
		if (user == null)
			throw new AppError(404, 'User not found');
		return notificationCtrl.findByUser(user, count, onlyUnread);
	},
	getNotificationById: async (userId, notificationId) => {
		let user = await findById(userId, ['_id', 'username', 'notifications']);
		if (user == null)
			throw new AppError(404, 'User not found');
		return notificationCtrl.findById(user, notificationId);
	},
	getUnreadNotificationsCount: async (userId) => {
		let user = await findById(userId, ['_id', 'username', 'notifications']);
		if (user == null)
			throw new AppError(404, 'User not found');
		return await notificationCtrl.getUnreadCount(user);
	},
	createNotification: async (userId, notification) => {
		let user = await findById(userId, ['_id', 'username', 'notifications']);
		if (user == null)
			throw new AppError(404, 'User not found');
		return await notificationCtrl.create(user, notification);
	},
	updateNotification: async (userId, notificationId, notification) => {
		let user = await findById(userId, ['_id', 'username', 'notifications']);
		if (user == null)
			throw new AppError(404, 'User not found');
		return await notificationCtrl.update(user, notificationId, notification);
	},
	readAllNotifications: async (userId) => {
		let user = await findById(userId, ['_id', 'username', 'notifications']);
		if (user == null)
			throw new AppError(404, 'User not found');
		await notificationCtrl.readAll(user);	
	},
	deleteNotification: async (userId, notificationId) => {
		let user = await findById(userId, ['_id', 'username', 'notifications']);
		if (user == null)
			throw new AppError(404, 'User not found');
		return await notificationCtrl.delete(user, notificationId);
	},
	deleteAllNotifications: async (userId) => {
		let user = await findById(userId, ['_id', 'username', 'notifications']);
		if (user == null)
			throw new AppError(404, 'User not found');
		return await notificationCtrl.deleteAll(user);
	},

	//likes
	setLikeState,

	// Helper functions
	hashPassword,

	createUsersToDeliver,

	getReviews,
	getReviewById,
	createReview,
	updateReview,
	deleteReview,
	createReviewAnswer,
	updateReviewAnswer,
	deleteReviewAnswer,
	buildProfile: buildProfileObject,
	getDashboardInfo,
	createSimpleUserObject
};

async function findById(id, selectionfields) {
	try {
		checkUserId(id);
		if (!selectionfields)
			selectionfields = [];
		return await User.findById(
			id,
			selectionfields.join(' ')
		);
	} catch (e) {
		throw new AppError(e);
	}
}

async function findByName(name, selectionfields) {
	try {
		name = name ? name : '';
		if (!selectionfields)
			selectionfields = [];
		let user = await User.findOne(
			{ username: name },
			selectionfields.join(' ')
		);
		return user;
	} catch (e) {
		throw new AppError(e);
	}
}

function hashPassword(user) {
	// todo: salt is missing
	if (user.password) {
		const hash = crypto.createHash('sha256');
		hash.update(user.password);
		user.password = hash.digest('hex');
	}
}

function createUsersToDeliver(users, authUser) {
	let result;
	if (Array.isArray(users)) {
		let usersToDeliver = [];
		users.forEach((user) => {
			usersToDeliver.push(prepareUserDeliveryFields(user, authUser, deliveredProperties));
		});
		result = usersToDeliver;
	} else {
		result = prepareUserDeliveryFields(users, authUser, deliveredProperties);
	}

	return result;
}

function checkInfoFields(nvGeneralInfo) {

	if (Object.keys(nvGeneralInfo).includes('generalInfo')) {
		let generalInfo = nvGeneralInfo.generalInfo;
		if (!generalInfo.visibility || !isEmpty(generalInfo.biography)) throw new AppError(400, 'Invalid values in generalInfo.');
	}
	if (Object.keys(nvGeneralInfo).includes('additionalInfo')) {
		let additionalInfo = nvGeneralInfo.additionalInfo;
		if (!additionalInfo.visibility || !isEmpty(additionalInfo.jobTitle) || !isEmpty(additionalInfo.education) || !isEmpty(additionalInfo.residency)) throw new AppError(400, 'Invalid values in additional Info.');
	}
	if (Object.keys(nvGeneralInfo).includes('privateInfo')) {
		let privateInfo = nvGeneralInfo.privateInfo;
		if (!privateInfo.visibility || !isEmpty(privateInfo.phoneNumber)) throw new AppError(400, 'Invalid values in privateInfo.');
	}
}

function isEmpty(str) {
	try {
		if (str.length >= 0) return true;
		return false;
	}
	catch (e) {
		throw new AppError(400, 'Invalid value in Info fields.');
	}
}

function prepareUserDeliveryFields(user, authUser, properties) {

	user = user.toObject();
	user.password = undefined;
	let username = user.username;
	delete user.username;
	user.privateInfo.username = username;

	user = createObjectToDeliver(user, properties);

	if (user._id.toString() === authUser.id.toString())	return user;
	if (user.generalInfo.visibility === 'private') delete user.generalInfo;

	if (user.privateInfo.visibility === 'private') delete user.privateInfo;

	if (user.additionalInfo.visibility === 'private') delete user.additionalInfo;
  
	return user;
}

async function getReviews(userId) {
	let user = await findById(userId);
	if (!user)
		throw new AppError(404, 'Could not get reviews, specified User not found.');
	return await reviewController.findAll(user);
}

async function createReview(userId, review, reviewer) {
	let user = await findById(userId);
	if (!user)
		throw new AppError(404, 'Specified User not found.');
	return await reviewController.create(user, review, reviewer);
}

async function getReviewById(userId, reviewId) {
	let user = await findById(userId);
	if (!user)
		throw new AppError(404, 'Could not get reviews, specified User not found.');
	return await reviewController.findById(user, reviewId, true);
}

async function updateReview(userId, newReviewValues, reviewer, reviewId) {
	let user = await findById(userId);
	if (!user)
		throw new AppError(404, 'Could not get reviews, specified User not found.');
	return await reviewController.update(user, newReviewValues, reviewer, reviewId);
}

async function deleteReview(userId, reviewId, reviewer) {
	let user = await findById(userId);
	if (!user)
		throw new AppError(404, 'Could not get reviews, specified User not found.');
	return await reviewController.delete(user, reviewId, reviewer);
}

async function createReviewAnswer(userId, reviewId, author, content) {
	let user = await findById(userId);
	if (!user)
		throw new AppError(404, 'Specified User not found.');
	return await reviewController.createAnswer(user, reviewId, author, content);
}

async function updateReviewAnswer(userId, reviewId, answerId, author, newContent) {
	let user = await findById(userId);
	if (!user)
		throw new AppError(404, 'Specified User not found.');
	return await reviewController.updateAnswer(user, reviewId, answerId, author, newContent);
}

async function deleteReviewAnswer(userId, reviewId, answerId, author) {
	let user = await findById(userId);
	if (!user)
		throw new AppError(404, 'Specified User not found.');
	await reviewController.deleteAnswer(user, reviewId, answerId, author);
}

async function buildProfileObject(userId, authUser) {
	try {
		let user = await findById(userId);
		if (!user)
			throw new AppError(404, 'Could not get reviews, specified User not found.');
		
		//it's easier to work with a vanilla js array than the mongoose array when only having to handle user output
		user = prepareUserDeliveryFields(user, authUser, [...profileProperties, 'eligableToReview', 'likedOfferors']);
		await reviewController.calculateRatingAverage(user);
		reviewController.determineCanReview(user, authUser);
		reviewController.prepareReviewDeliveryFields(user, authUser);
		
		user.statistics.likedState = getLikedOfferrorIndex(user, authUser.id) != -1;

		user.reviews = await reviewController.createReviewsToDeliver(user.reviews);
		if (user.myReview)
			user.myReview = await reviewController.createReviewsToDeliver(user.myReview);

		delete user.eligableToReview;
		delete user.likedOfferors;
		return user;	
	}
	catch (e) {
		throw new AppError(e);
	}
}

async function setLikeState(userId, authUser, body) {
	try {
		let user = await findById(userId);
		if (!user)
			throw new AppError(404, 'User not found.');
		
		let idx = getLikedOfferrorIndex(user, authUser.id);
		
		if (body.likeState == undefined || body.likeState == null)
			throw new AppError(400, 'Invalid payload.');
		
		if (typeof body.likeState != 'boolean')
			throw new AppError(400, 'Invalid payload.');

		if (body.likeState) {
			if (idx == -1) {
				user.statistics.likeCount++;
				user.likedOfferors.push(authUser.id);
				await user.save();
			}
		}
		else {
			if (idx != -1) {
				user.statistics.likeCount--;
				user.likedOfferors.splice(idx, 1);
				await user.save();
			}
		}
	}
	catch (e) {
		throw new AppError(e);
	}
}

function getLikedOfferrorIndex(user, authUserId) {
	return user.likedOfferors.findIndex(id => id.toString() === authUserId.toString());
}

async function getDashboardInfo(authUser) {
	try {
		let user = await findById(authUser.id, dashBoardInfoProperties);
		if (!user)
			throw new AppError(404, 'User not found');
		
		let deliveryUser = {
			students: [],
			teachers: [],
			offersEnrolledIn: user.offersEnrolledIn,
			myOffers: user.createdOffers,
			offersAttendeeIn: user.offersAttendeeIn
		};
		for (let userId of user.students) {
			deliveryUser.students.push(await createSimpleUserObject(userId));
		}
		for (let userId of user.teachers) {
			deliveryUser.teachers.push(await createSimpleUserObject(userId));
		}
		
		return deliveryUser;
	}
	catch (e) {
		throw new AppError(e);
	}
}

async function createSimpleUserObject(userId) {
	let user = await findById(userId, ['_id', 'firstname', 'lastname']);
	if (!user)
		throw new AppError(404, 'User not found');
	
	user = user.toObject();
	return { ...user, pictureUrl: 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' };
}

module.exports = userCtrl;