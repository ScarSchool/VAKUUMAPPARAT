const express = require('express');
const router = express.Router();

const { checkId, getPlainQueryString, checkQueryString } = require('../middleware/router-helpers');
const { handleAsyncError } = require('../errorhandling/error-handler');
const AppError = require('../errorhandling/error-model');

const tagController = require('./tag-controller');

router.get('/', handleAsyncError(async (req, res) => {
    let qs = getPlainQueryString(req);
    
    //no query string
	if (!qs)
		return res.json(await tagController.findAll());


	// pattern for querystring: includes AND limit (optional)
	checkQueryString(qs, /includes=[^&]+(&limit=[0-9]+)?$/);

	// GET /tags?includes=tagName
    if (req.query.includes) {
        let limit = req.query.limit && !isNaN(req.query.limit) ? parseInt(req.query.limit) : 0;
		return res.json(await tagController.includes(req.query.includes, limit));
    }

    throw new AppError(500, 'unexcepted');
}));

router.get('/:id', checkId, handleAsyncError(async (req, res) => {
    let selectedTag = await tagController.findById(req.params.id);
    if(!selectedTag){
        throw new AppError(404, 'Category not found');
    }
    res.json(selectedTag);
}));

router.post('/', handleAsyncError(async (req, res) => {
    let createdTag = await tagController.create(req.body);
    res.status(201).json(createdTag);
}));

router.patch('/:id', checkId, handleAsyncError(async (req, res) => {
    let updatedTag = await tagController.update(req.params.id, req.body);
    res.status(200).json(updatedTag);
}));

router.delete('/:id', checkId, handleAsyncError(async (req, res) => {
    await tagController.delete(req.params.id);
    res.status(204).send();
}));

module.exports = router;