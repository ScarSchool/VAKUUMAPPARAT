const express = require('express');
const router = express.Router();
const longpoll = require('express-longpoll')(router);

const { checkId, getPlainQueryString, checkQueryString } = require('../middleware/router-helpers');
const { handleAsyncError } = require('../errorhandling/error-handler');
const { authenticate } = require('../authentication/auth-router');
const AppError = require('../errorhandling/error-model');

const userController = require('./user-controller');
const notificationController = require('./../notifications/notification-controller');
const { createUsersToDeliver } = require('./user-controller');
const { createNotificationsToDeliver } = require('../notifications/notification-controller');

//#region Notification CRUDs
longpoll.create('/:id/notifications/poll', [authenticate, checkId, function (req, res, next) {
	if (req.params.id !== req.user.id)
		throw new AppError(401, 'Unauthorized');
	req.id = req.params.id;
	next();
}]);

//#region dashboard
router.get('/dashboardInfo', authenticate, handleAsyncError(async (req, res) => {
	res.json(await userController.getDashboardInfo(req.user));
}));
//#endregion

router.get('/notifications', authenticate, handleAsyncError(async (req, res) => {
	return res.json(await getNotificationsByUser(req.user.id, req.query.count, req.query.onlyUnread));
}));

router.get('/:id/notifications', authenticate, checkId, handleAsyncError(async (req, res) => {
	if (req.user.id != req.params.id)
		throw new AppError(401, 'Unauthorized');
	return res.json(await getNotificationsByUser(req.params.id, req.query.count, req.query.onlyUnread));
}));

async function getNotificationsByUser(userId, count, onlyUnread) {
	return createNotificationsToDeliver(await userController.getNotificationsByUser(userId, count, onlyUnread));
}

router.get('/notifications/unread', authenticate, handleAsyncError(async (req, res) => {
	return res.json(await userController.getUnreadNotificationsCount(req.user.id));
}));

router.get('/notifications/:notificationId', authenticate, handleAsyncError(async (req, res) => {
	return res.json(await getNotificationById(req.user.id, req.params.notificationId));
}));

router.get('/:id/notifications/:notificationId', authenticate, checkId, handleAsyncError(async (req, res) => {
	if (req.user.id != req.params.id)
		throw new AppError(401, 'Unauthorized');
	return res.json(await getNotificationById(req.params.id, req.params.notificationId));
}));

async function getNotificationById(userId, notificationId) {
	let notification = await userController.getNotificationById(userId, notificationId);
	if (!notification)
		throw new AppError(404, 'notification not found');
	return createNotificationsToDeliver(notification);
}


router.post('/:id/notifications', authenticate, checkId, handleAsyncError(async (req, res) => {
	if (req.user.id != req.params.id)
		throw new AppError(401, 'Unauthorized');
	let createdNotification = await userController.createNotification(req.params.id, req.body);
	res.status(201).json(createNotificationsToDeliver(createdNotification));
}));

router.patch('/notifications/readAll', authenticate, handleAsyncError(async (req, res) => {
	await userController.readAllNotifications(req.user.id);
	res.status(204).send();
}));

router.patch('/notifications/:notificationId', authenticate, handleAsyncError(async (req, res) => {
	let updatedNotification = await userController.updateNotification(req.user.id, req.params.notificationId, req.body);
	res.json(createNotificationsToDeliver(updatedNotification));
}));

router.patch('/notifications/read/:notificationId', authenticate, handleAsyncError(async (req, res) => {
	let updatedNotification = await userController.updateNotification(req.user.id, req.params.notificationId, { read: true });
	res.json(createNotificationsToDeliver(updatedNotification));
}));

router.delete('/notifications/deleteAll', authenticate, handleAsyncError(async (req, res) => {
	await userController.deleteAllNotifications(req.user.id);
	res.status(204).send();
}));

router.delete('/notifications/:notificationId', authenticate, handleAsyncError(async (req, res) => {
	await userController.deleteNotification(req.user.id, req.params.notificationId);
	res.status(204).send();
}));
//#endregion


//#region User CRUDs
router.post('/', handleAsyncError(async (req, res) => {
	let createdUser = await userController.create(req.body);
	res.status(201).json(createdUser);
}));

router.get('/', authenticate, handleAsyncError(async function (req, res) {
	let qs = getPlainQueryString(req);

	// no query-string provided
	if (!qs) {
		return res.json(createUsersToDeliver(await userController.findAll(userController.deliveredProperties), req.user));
	}

	// pattern for querystring: state XOR username (just one key allowed - otherwise throw 400
	checkQueryString(qs, /state=[^&]+$|username=[^&]+$/);

	// GET /users?state=active
	if (req.query.state) {
		return res.json(createUsersToDeliver(await userController.findByState(req.query.state, userController.deliveredProperties), req.user));
	}

	// GET /users?username=kaa@htl-villach.at
	if (req.query.username) {
		let selectionResult = await userController.findByName(req.query.username);
		if (selectionResult == null) {
			throw new AppError(404, 'user not found');
		}
		return res.json(createUsersToDeliver(selectionResult, req.user));
	}

	// to avoid no response
	throw new AppError(500, 'unexcepted');
}));

router.get('/:id', authenticate, checkId, handleAsyncError(async (req, res) => {
	let selectedUser = await userController.findById(req.params.id);
	if (selectedUser == null)
		throw new AppError(404, 'user not found');

	res.json(createUsersToDeliver(selectedUser, req.user));
}));

router.get('/:id/profile', authenticate, checkId, handleAsyncError(async (req, res) => {
	res.json(await userController.buildProfile(req.params.id, req.user));
}));

router.patch('/:id', authenticate, checkId, handleAsyncError(async (req, res) => {
	let updatedUser = await userController.update(req.params.id, req.body, req.user);
	res.status(200).json(createUsersToDeliver(updatedUser, req.user));
}));

router.delete('/:id', authenticate, checkId, handleAsyncError(async (req, res) => {
	await userController.delete(req.params.id);
	res.status(204).send();
}));
//#endregion

//#region Review CRUD
router.get('/:id/reviews', handleAsyncError(async (req, res) => {
	let reviews = await userController.getReviews(req.params.id);
	res.status(200).json(reviews);
}));

router.get('/:id/reviews/:reviewId', checkId, handleAsyncError(async (req, res) => {
	let review = await userController.getReviewById(req.params.id, req.params.reviewId);
	res.status(200).json(review);
}));

router.post('/:id/reviews', authenticate, checkId, handleAsyncError(async (req, res) => {
	let createdReview = await userController.createReview(req.params.id, req.body, req.user);
	if (createdReview) {
		let content = req.params.id;
        await notificationController.create(await userController.findById(req.params.id), notificationController.createNodeObject(
            'Someone wrote a new review on your profile page',
            'info',
            'A attendee left a review on your profile. See what they have to say!',
            'profilereview',
            content
        ));
	}
    res.status(201).json(createdReview);
}));

router.patch('/:id/reviews/:reviewId', authenticate, checkId, handleAsyncError(async (req, res) => {
	let updatedReview = await userController.updateReview(req.params.id, req.body, req.user, req.params.reviewId);
	res.status(200).json(updatedReview);
}));

router.delete('/:id/reviews/:reviewId', authenticate, checkId, handleAsyncError(async (req, res) => {
	await userController.deleteReview(req.params.id, req.params.reviewId, req.user);
	res.status(204).send();
}));
//#endregion

//#region Answers
router.post('/:id/reviews/:reviewId/answers', authenticate, checkId, handleAsyncError(async (req, res) => {
	if (!req.body || Object.keys(req.body).length != 1 || req.body.content == undefined)
		throw new AppError(400, 'Wrong fields for creating review answer');
	let review = await userController.createReviewAnswer(req.params.id, req.params.reviewId, req.user, req.body.content);
	if (review) {
		let content = req.params.id;
		let nodeObject = notificationController.createNodeObject(
			'Someone wrote a answer to a review you are part of',
			'info',
			'You got a new answer to a review where you are part of. Check it out!',
			'profilereply',
			content
		);
		if (req.params.id != req.user.id) {
			await notificationController.create(await userController.findById(req.params.id), nodeObject);
		}
		if (review.author._id != req.user.id) {
			await notificationController.create(await userController.findById(review.author._id), nodeObject);
		}
		let answereAuthorIds = [];
		review.answers.forEach(async answer => {
			if (!answereAuthorIds.includes(answer.user._id.toString()) && answer.user._id.toString() != review.author._id.toString() && answer.user._id.toString() != req.user.id) {
				answereAuthorIds.push(answer.user._id.toString());
				await notificationController.create(await userController.findById(answer.user._id.toString()), nodeObject);
			}
		});
	}
    res.status(201).json(review);
}));

router.patch('/:id/reviews/:reviewId/answers/:answerId', authenticate, checkId, handleAsyncError(async (req, res) => {
	if (!req.body || Object.keys(req.body).length != 1 || req.body.content == undefined)
		throw new AppError(400, 'Wrong fields for updating review answer');
	let review = await userController.updateReviewAnswer(req.params.id, req.params.reviewId, req.params.answerId, req.user, req.body.content);
    res.status(200).json(review);
}));

router.delete('/:id/reviews/:reviewId/answers/:answerId', authenticate, checkId, handleAsyncError(async (req, res) => {
	await userController.deleteReviewAnswer(req.params.id, req.params.reviewId, req.params.answerId, req.user);
    res.status(204).json();
}));
//#endregion

//#region Likes
router.patch('/:id/setLikeState', authenticate, checkId, handleAsyncError(async (req, res) => {
	await userController.setLikeState(req.params.id, req.user, req.body);
	if (req.body.likeState && (req.body.likeState == true || req.body.likeState == 'true')) {
		let content = req.params.id;
		await notificationController.create(await userController.findById(req.params.id), notificationController.createNodeObject(
			'Someone liked your profile',
			'info',
			'Congratulations! You got a new like on your profile page.',
			'profilelike',
			content
		));
	}
	res.status(204).send();
}));
//#endregion
	
module.exports = router;