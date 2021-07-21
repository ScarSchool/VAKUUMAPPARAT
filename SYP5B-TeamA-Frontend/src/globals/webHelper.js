import config from '../configs/config';
import AppMessage, { ErrorMessage } from './AppMessage';


const webHelper = {};
const backend = `${config.protocol}://${config.hostname}:${config.port}${config.apiVersion}`;


/*
 * User
 */

webHelper.userLogin = function (credentials) {
    return webHelper.postOne(credentials, null, config.loginEndpoint);
}

webHelper.postOneUser = function (newUser) {
    return webHelper.postOne(newUser, null, config.usersEndpoint);
}

webHelper.patchOneUser = function (token, userId, updatedUser) {
    return webHelper.patchOne(userId, updatedUser, token, config.usersEndpoint);
}

webHelper.getOneUser = function (token, userId) {
    return webHelper.getOne(token, config.usersEndpoint, userId);
}

webHelper.likeOneUser = function(token, userId, likeState) {
    return webHelper.patchOne('', {likeState}, token, `${config.usersEndpoint}/${userId}${config.userLikeEndpoint}`);
}

webHelper.getDashboardInfo = function(token) {
    return webHelper.getOne(token, `${config.usersEndpoint}${config.dashboardEndpoint}`, '');
}

/*
 * Profile
 */

webHelper.getOneUserProfile = function (token, userId) {
    return webHelper.getAll(token, `${config.usersEndpoint}/${userId}${config.profileEndpoint}`);
}

/*
 * Reviews
 */

webHelper.postOneReview = function (token, review, userId) {
    return webHelper.postOne(review, token, `${config.usersEndpoint}/${userId}${config.reviewsEndpoint}`)
}

webHelper.deleteOneReview = function (token, reviewId, userId) {
    return webHelper.deleteOne(reviewId, token, `${config.usersEndpoint}/${userId}${config.reviewsEndpoint}`)
}

webHelper.patchOneReview = function (token, reviewId, newReview, userId) {
    return webHelper.patchOne(reviewId, newReview, token, `${config.usersEndpoint}/${userId}${config.reviewsEndpoint}`)
}

webHelper.postOneAnswer = function(token, userId, reviewId, answer) {
    return webHelper.postOne(answer, token, `${config.usersEndpoint}/${userId}${config.reviewsEndpoint}/${reviewId}${config.answersEndpoint}`);
}

webHelper.deleteOneAnswer = function(token, userId, reviewId, answerId) {
    return webHelper.deleteOne(answerId, token, `${config.usersEndpoint}/${userId}${config.reviewsEndpoint}/${reviewId}${config.answersEndpoint}`);
}

webHelper.patchOneAnswer = function(token, userId, reviewId, answerId, answer) {
    return webHelper.patchOne(answerId, answer, token, `${config.usersEndpoint}/${userId}${config.reviewsEndpoint}/${reviewId}${config.answersEndpoint}`);
}

/*
 * Tags
 */

webHelper.getAllTags = function (token) {
    return webHelper.getAll(token, config.tagsEndpoint);
}

/*
 * Categories
 */

webHelper.getAllCategories = function (token) {
    return webHelper.getAll(token, config.categoriesEndpoint)
}

webHelper.getOneCategory = function (token, categoryId) {
    return webHelper.getOne(token, config.categoriesEndpoint, categoryId);
}

webHelper.postOneCategory = function (token, newCategory) {
    return webHelper.postOne(newCategory, token, config.categoriesEndpoint);
}

/*
 * Demand for offers
 */

webHelper.reportDemand = function (token, categoryId) {
    return webHelper.patchOne('', {}, token, `${config.categoriesEndpoint}/${categoryId}/reportDemand`);
}

webHelper.removeDemand = function (token, categoryId) {
    return webHelper.patchOne('', {}, token, `${config.categoriesEndpoint}/${categoryId}/removeDemand`);
}

/*
 * Offers
 */


webHelper.getOneOfferOfCategory = function (token, categoryId, offerId) {
    return webHelper.getOne(token, `${config.categoriesEndpoint}/${categoryId}/offers`, offerId);
}

webHelper.getAllOffersOfCategory = function (token, categoryId) {
    return webHelper.getAll(token, `${config.categoriesEndpoint}/${categoryId}/offers`);
}

webHelper.postOneOfferOfCategory = function (token, categoryId, offer) {
    return webHelper.postOne(offer, token, `${config.categoriesEndpoint}/${categoryId}/offers`);
}

webHelper.patchOneOfferOfCategory = function (token, categoryId, offerId, offer) {
    return webHelper.patchOne(offerId, offer, token, `${config.categoriesEndpoint}/${categoryId}/offers`)
}

webHelper.deleteOneOfferOfCategory = function (token, categoryId, offerId) {
    return webHelper.deleteOne(offerId, token, `${config.categoriesEndpoint}/${categoryId}/offers`)
}

webHelper.getSomeOffersOfCategory = function (token, categoryId, tags, title) {

    let queryTitle = title !== '' ? `title=${title}` : '';

    let queryTags = tags.length > 0 ? `tags=${tags.join(';')} ` : '';
    let query = ''
    if (queryTitle !== '' && queryTags !== '')
        query = `${queryTitle}&${queryTags}`;
    else
        query = `${queryTitle}${queryTags}`;

    return webHelper.getSome(query, token, `${config.categoriesEndpoint}/${categoryId}/offers`);
}

/*
 * Enrollment
 */

webHelper.acceptAttendee = function (token, categoryId, offerId, attendeeId) {
    return webHelper.patchOne('', { 'id': attendeeId }, token, `${config.categoriesEndpoint}/${categoryId}/offers/${offerId}/acceptAttendee`);
}

webHelper.rejectAttendee = function (token, categoryId, offerId, attendeeId) {
    return webHelper.patchOne('', { 'id': attendeeId }, token, `${config.categoriesEndpoint}/${categoryId}/offers/${offerId}/rejectAttendee`);
}

webHelper.enrollInOffer = function (token, categoryId, offerId, description) {
    return webHelper.patchOne('', { description: description }, token, `${config.categoriesEndpoint}/${categoryId}/offers/${offerId}/addEnrollment`);
}

webHelper.removeEnrollment = function (token, categoryId, offerId, userId) {
    return webHelper.patchOne('', { 'id': userId }, token, `${config.categoriesEndpoint}/${categoryId}/offers/${offerId}/removeEnrollment`);
}

/*
 * Notifications
 */

webHelper.postOneNotification = function (notification, token, userId) {
    return webHelper.postOne(notification, token, `${config.usersEndpoint}/${userId}${config.notificationsEndpoint}`)
}

webHelper.subscribeNotification = function (token, userId) {
    return webHelper.longPoll(token, `${config.usersEndpoint}/${userId}${config.notificationsEndpoint}/poll`)
}

webHelper.readNotification = function (token, notificationId) {
    return webHelper.patchOne(notificationId, null, token, `${config.usersEndpoint}${config.notificationsEndpoint}/read`)
}

webHelper.getSomeNotificationsByCount = function (token, notificationCount) {
    return webHelper.getSome(`count=${notificationCount}`, token, `${config.usersEndpoint}${config.notificationsEndpoint}`)
}

webHelper.getAllNotifications = function (token) {
    return webHelper.getAll( token, `${config.usersEndpoint}${config.notificationsEndpoint}`)
}

webHelper.getUnreadNotifications = function (token) {
    return webHelper.getSome(`onlyUnread=true`, token, `${config.usersEndpoint}${config.notificationsEndpoint}`)
}

webHelper.getUnreadNotificationCount = function (token) {
    return webHelper.getAll( token, `${config.usersEndpoint}${config.notificationsEndpoint}/unread`)
}

webHelper.setNotificationsRead = function (token) {
    return webHelper.patch(null, token, `${config.usersEndpoint}${config.notificationsEndpoint}/readAll` )
}

/*
 * General methods
 */

webHelper.longPoll = function (token, endpoint) {
    let requestOptions = {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    };
    let url = (`${backend}${endpoint}`);

    return new Promise((resolve, reject) => {
        // console.debug('DEBUG: Fetching url: ', url, ' Request options are ', requestOptions);
        fetch(url, requestOptions).then(res => {
            if (res.status === 502)
                return resolve(this.longPoll(token, endpoint));
            if (res.status >= 500)
                return reject(new AppMessage(
                    AppMessage.types.ERROR,
                    'The server encountered an internal problem.',
                    res.status));
            if (res.status === 401) {
                return res.json().then(err => {
                    // TODO: Check whether error object is valid?
                    // window.location.pathname = '/logout'
                    err.message = err.message[0].toUpperCase() + err.message.slice(1, err.message.length)
                    err.status = res.status;
                    reject(new ErrorMessage(err));
                });
            }
            if (res.status >= 400)
                return res.json().then(err => {
                    // TODO: Check whether error object is valid?
                    err.message = err.message[0].toUpperCase() + err.message.slice(1, err.message.length)
                    err.status = res.status;
                    reject(new ErrorMessage(err));
                });

            return res.json();
        }).then(data => {
            resolve(data);
        }).catch(err => {
            console.warn(`DEBUG: Error while doing a web call: ${err}`);
            reject(new AppMessage(
                AppMessage.types.ERROR,
                'Could not connect to the server.'));
        });
    });
}

webHelper.postOne = function (newObject, token, endpoint) {
    let requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newObject)
    };

    return httpCall(
        `${backend}${endpoint}`,
        requestOptions
    );
}

webHelper.postQuery = function (newObject, query, token, endpoint) {
    let requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newObject)
    };
    return httpCall(
        `${backend}${endpoint}/?${query}`,
        requestOptions
    )
}

webHelper.getOne = function (token, endpoint, id) {
    let requestOptions = {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    };
    return httpCall(
        `${backend}${endpoint}/${id}`,
        requestOptions
    );
}

webHelper.getAll = function (token, endpoint) {
    let requestOptions = {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    };
    return httpCall(
        `${backend}${endpoint}`,
        requestOptions
    );
}

webHelper.getSome = function (query, token, endpoint) {
    let requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };

    return httpCall(
        `${backend}${endpoint}?${query}`,
        requestOptions
    )
}

webHelper.patchOne = function (id, newObject, token, endpoint) {
    let requestOptions = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    if (newObject)
        requestOptions.body = JSON.stringify(newObject)
    return httpCall(
        `${backend}${endpoint}/${id}`,
        requestOptions
    );
}

webHelper.patch = function (newObject, token, endpoint) {
    let requestOptions = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    if (newObject)
        requestOptions.body = JSON.stringify(newObject)
    return httpCall(
        `${backend}${endpoint}`,
        requestOptions
    );
}

webHelper.patchQuery = function (path, query, token, endpoint) {
    let requestOptions = {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };
    return httpCall(
        `${backend}${endpoint}/${path}?${query}#`,
        requestOptions
    );
}

webHelper.deleteOne = function (id, token, endpoint) {
    let requestOptions = {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };
    return httpCall(
        `${backend}${endpoint}/${id}`,
        requestOptions
    );
}

function httpCall(url, requestOptions) {
    return new Promise((resolve, reject) => {
        // console.debug('DEBUG: Fetching url: ', url, ' Request options are ', requestOptions);
        fetch(url, requestOptions).then(res => {
            if (res.status >= 500)
                return reject(new AppMessage(
                    AppMessage.types.ERROR,
                    'The server encountered an internal problem.',
                    res.status));
            if (res.status === 401) {
                return res.json().then(err => {
                    // TODO: Check whether error object is valid?
                    // window.location.pathname = '/logout'
                    err.message = err.message[0].toUpperCase() + err.message.slice(1, err.message.length)
                    err.status = res.status;
                    reject(new ErrorMessage(err));
                });
            }

            if (res.status === 404)
                return reject(new AppMessage(
                    AppMessage.types.ERROR,
                    'Resource could not be found',
                    res.status
                ))

            if (res.status >= 400)
                return res.json().then(err => {
                    // TODO: Check whether error object is valid?
                    err.message = err.message[0].toUpperCase() + err.message.slice(1, err.message.length)
                    err.status = res.status;
                    reject(new ErrorMessage(err));
                });

            if (res.status === 204)     // Resolving with 204 noContent
                return resolve();

            return res.json();
        }).then(data => {
            resolve(data);
        }).catch(err => {
            console.warn(`DEBUG: Error while doing a web call:`, err);
            reject(new AppMessage(
                AppMessage.types.ERROR,
                'Could not connect to the server.'));
        });
    });
}

export default webHelper;