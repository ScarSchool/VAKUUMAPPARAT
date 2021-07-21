const AppError = require('../errorhandling/error-model');
const offerController = require('./../offers/offer-controller');

module.exports.checkIds = (req, res, next) => {

    //check categoryId and offerId

    next();
};

module.exports.checkMinMaxAttendees = (req, res, next) => {
    let min = req.body.minAttendees;
    let max = req.body.maxAttendees;
    if (!offerController.checkMinMaxAttendees(min, max)) {
        console.error(`Failed to check minAttendess(${min}) greater than maxAttendees(${max})`);
        throw new AppError(400, 'Failed to check minAttendess greater than maxAttendees');
    }
    next();
};