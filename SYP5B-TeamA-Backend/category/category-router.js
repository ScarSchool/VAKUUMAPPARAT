const express = require('express');
const router = express.Router();

const { checkId, getPlainQueryString } = require('../middleware/router-helpers');
const { checkIds, checkMinMaxAttendees } = require('../middleware/offer-helper');
const { handleAsyncError } = require('../errorhandling/error-handler');
const AppError = require('../errorhandling/error-model');

const categoryController = require('./category-controller');
const offerController = require('./../offers/offer-controller');
const notificationController = require('./../notifications/notification-controller');
const userController = require('./../user/user-controller');
const categoryCtrl = require('./category-controller');

//#region Category CRUDS ***********************
router.get('/', handleAsyncError(async (req, res) => {
    let allCategories = await categoryController.findAll(req.user);
    res.status(200).json(allCategories);
}));

router.get('/:id', checkId, handleAsyncError(async (req, res) => {
    let selectedCategory = await categoryController.findById(req.params.id, req.user);
    if(!selectedCategory){
        throw new AppError(404, 'Category not found');
    }
    res.status(200).json(selectedCategory);
}));

router.post('/', handleAsyncError(async (req, res) => {
    let createdCategory = await categoryController.create(req.body, req.user);
    res.status(201).json(createdCategory);
}));

router.patch('/:id', checkId, handleAsyncError(async (req, res) => {
    let updatedCategory = await categoryController.update(req.params.id, req.body, req.user);
    res.status(200).json(updatedCategory);
}));

router.delete('/:id', checkId, handleAsyncError(async (req, res) => {
    await categoryController.delete(req.params.id);
    res.status(204).send();
}));

router.patch('/:id/reportDemand', handleAsyncError(async (req, res) => {
    let result = await categoryController.addDemand(req.params.id, req.user);
    res.status(200).json(result);
}));

router.patch('/:id/removeDemand', checkId, handleAsyncError(async (req, res) => {
    let result = await categoryController.removeDemand(req.params.id, req.user);
    res.status(200).json(result);
}));
//#endregion

//#region Offer CRUDS ***********************
router.get('/:categoryId/offers', handleAsyncError(async (req, res) => {
    let qs = getPlainQueryString(req);
    
    //no query string
	if (!qs)
		return res.json(await offerController.findAll(req.params.categoryId, req.user));    

	// GET /offers?title=asdas&tags=tag1;tag2;tag3
    if (req.query.tags || req.query.title) {
        let allTags = [];
        let tagsString = '';
        let tags = [];
        if (req.query.tags) {
            tagsString = req.query.tags.toLowerCase();
            tags = tagsString.split(';');                   
        }

        let titleTags = [];
        let title = '';
        if (req.query.title) {
            title = req.query.title.toLowerCase();
            titleTags = title.split(' ');
        }
        
        allTags = [...tags, ...titleTags];
		return res.json(await offerController.filter(req.params.categoryId, title, allTags, req.user));
    }
    throw new AppError(400, 'query string not correct');
}));

router.get('/:categoryId/offers/:offerId', checkIds, handleAsyncError(async (req, res) => {
    let selectedOffer = await offerController.findById(req.params.categoryId, req.params.offerId, true, req.user);
    if(!selectedOffer){
        throw new AppError(404, 'Offer not found');
    }
    res.json(selectedOffer);
}));

router.post('/:categoryId/offers', checkMinMaxAttendees, handleAsyncError(async (req, res) => {
    let createdOffer = await offerController.create(req.body, req.user, req.params.categoryId);
    if (createdOffer) {
        let category = await categoryCtrl.findById(req.params.categoryId, req.user);
        let demands = await categoryCtrl.getDemands(req.params.categoryId, req.user);
        if (category && demands) {
            for (let demand of demands) {
                if (demand.userId != req.user.id) {
                    await notificationController.create(await userController.findById(demand.userId), notificationController.createNodeObject(
                        `Someone created an offer in your demanded category '${category.name}'`,
                        'info',
                        'Check the new offers!',
                        'demand',
                        category._id
                    ));
                }
            }
        }
    }
    res.status(201).json(createdOffer);
}));

router.patch('/:categoryId/offers/:offerId', checkIds, checkMinMaxAttendees, handleAsyncError(async (req, res) => {
    let updatedOffers = await offerController.update(req.params.offerId, req.body, req.user, req.params.categoryId);
    res.status(200).json(updatedOffers);
}));

router.delete('/:categoryId/offers/:offerId', checkIds, handleAsyncError(async (req, res) => {
    await offerController.delete(req.params.offerId, req.user, req.params.categoryId);
    res.status(204).send();
}));
//#endregion

//#region Enroll attendees
router.patch('/:categoryId/offers/:offerId/addEnrollment', checkIds, handleAsyncError(async (req, res) => {
    let description = '';
    if (req.body && req.body.description && req.body.description.length >= 0)
        description = req.body.description;
    let result = await offerController.addEnrollment(req.params.offerId, req.user, req.params.categoryId, description);
    if (result) {
        let offeror = (await userController.findById(result.offerorId, ['_id', 'firstname', 'lastname']));
        if (offeror) {
            offeror = offeror.toObject();
            offeror.pictureUrl = 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png';
            let content = {
                _id: result.offer._id,
                categoryId: result.categoryId,
                offeror: offeror
            };
            await notificationController.create(await userController.findById(offeror._id), notificationController.createNodeObject(
                `You just got a new enrollment for the offer in '${result.categoryName}'`,
                'info',
                'Congratulations, you got a new enrollment!',
                'offerenroll',
                content
            ));
        }
    }
    res.status(204).send();
 }));

router.patch('/:categoryId/offers/:offerId/removeEnrollment', checkIds, handleAsyncError(async (req, res) => {
    await offerController.removeEnrollment(req.params.offerId, req.body, req.user, req.params.categoryId);
    res.status(204).send();
}));

router.patch('/:categoryId/offers/:offerId/acceptAttendee', checkIds, handleAsyncError(async (req, res) => {
    let result = await offerController.acceptAttendee(req.params.offerId, req.body, req.user, req.params.categoryId);
    if (result) {
        let content = {
            _id: result.offer._id,
            categoryId: result.categoryId,
            offeror: result.offeror
        };
        await notificationController.create(await userController.findById(req.body.id), notificationController.createNodeObject(
            `You just got accepted for the offer in '${result.categoryName}'`,
            'info',
            'Congratulations! You are part of a new offer.',
            'offeraccepted',
            content
        ));
    }
    res.status(204).send();
}));

router.patch('/:categoryId/offers/:offerId/rejectAttendee', checkIds, handleAsyncError(async (req, res) => {
    await offerController.rejectAttendee(req.params.offerId, req.body, req.user, req.params.categoryId);
    res.status(204).send();
}));
//#endregion
module.exports = router;