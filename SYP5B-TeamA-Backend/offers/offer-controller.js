const {
    createObjectToDeliver,
    createPayloadCheck,
} = require('../commons/controller-helpers');
const AppError = require('../errorhandling/error-model');
const User = require('../user/user-model');
const Category = require('../category/category-model');
const mongoose = require('mongoose');
const tagController = require('./../tags/tag-controller');

const requiredProperties = ['title', 'description', 'minAttendees', 'maxAttendees'];
const allowedProperties = [
    'title',
    'description',
    'tags',
    'minAttendees',
    'maxAttendees',
    'requirements'
];
const deliveredProperties = [
    '_id',
    'title',
    'description',
    'tags',
    'minAttendees',
    'maxAttendees',
    'requirements'
];
const userProperties = ['_id', 'firstname', 'lastname'];
const checkPayloadProps = createPayloadCheck(
    requiredProperties,
    allowedProperties
);

var defaultRequirementNames = [];

const OfferCtrl = {
    create: async (offer, user, categoryId) => {
        try {
            let category = await Category.findById(categoryId).exec();
            if (!category)
                throw new AppError(404, 'Category does not exist');
            if (!category.offers)
                category.offers = [];
            
            checkPayloadProps(offer, 'create');
            let currentOffer = offer;
            if (!currentOffer.requirements)
                currentOffer.requirements = [];
            else {
                checkRequirementsValid(currentOffer.requirements);
            }
            currentOffer.createdBy = user.id;
            currentOffer.enrollingAttendees = [];
            currentOffer.attendees = [];
            currentOffer.offersEnrolledIn = [];
            currentOffer.createdOffers = [];
            currentOffer.offersAttendeeIn = [];
            currentOffer._id = mongoose.Types.ObjectId();

            let loweredTags = [];
            if (currentOffer.tags && currentOffer.tags.length > 0) {
                currentOffer.tags.forEach(async tag => {
                    loweredTags.push(tag.toLowerCase());
                    let tagDb = await tagController.findByName(tag);
                    if (tagDb)
                        await tagController.update(tagDb._id, { useCount: tagDb.useCount + 1 });
                    else
                        await tagController.create({ name: tag, useCount: 1 });
                });
            }
            currentOffer.tags = loweredTags;

            category.offers.push(currentOffer);
            await category.save();

            let deliveryOffer = { ...currentOffer };

            let dbUser = await User.findById(user.id);
            dbUser.statistics.offerCount++;
            dbUser.createdOffers.push({ _id: currentOffer._id, categoryId: categoryId }); //await createSimpleOfferObject(currentOffer, dbUser, category.id, true)
            await dbUser.save();

            return await prepareOfferForDelivery(deliveryOffer, deliveryOffer.createdBy, user);
        } catch (e) {
            throw new AppError(e);
        }
    },

    findAll,
    filter: filter,
    findById,

    update: async (id, newValues, user, categoryId) => {
        try {
            checkPayloadProps(newValues, 'update');
            let category = await Category.findById(categoryId).exec();
            let offer = await getOfferFromCategory(id, categoryId);
             if (!offer) {
               throw new AppError(404, 'Offer does not exist.');
            }
             if (offer.createdBy.toString() !== user.id) {
               throw new AppError(400, 'Offer doesn\'t belong to user.');
            }
          
            let addedTags = [];
            let removedTags = [];
            let loweredTags = [];
            if (newValues.tags && Array.isArray(newValues.tags) && newValues.tags.length > 0) {
                newValues.tags.forEach(tag => {
                    loweredTags.push(tag.toLowerCase());
                    if (!offer.tags.includes(tag))
                        addedTags.push(tag);
                });
                offer.tags.forEach(tag => {
                    if (!newValues.tags.includes(tag))
                        removedTags.push(tag);
                });
                addedTags.forEach(async tag => {
                    let tagDb = await tagController.findByName(tag);
                    if (tagDb)
                        await tagController.update(tagDb._id, { useCount: tagDb.useCount + 1 });
                    else
                        await tagController.create({ name: tag, useCount: 1 });
                });
                removedTags.forEach(async tag => {
                    let tagDb = await tagController.findByName(tag);
                    if (tagDb) {
                        if (tagDb.useCount <= 1)
                            await tagController.delete(tagDb._id);
                        else
                            tagController.update(tagDb._id, { useCount: tagDb.useCount - 1 });
                    }
                });
                newValues.tags = loweredTags;
            }
          
            checkRequirementsValid(newValues.requirements);

            for (let key in newValues) {
              offer[key] = newValues[key];
            }
            
            saveChanges(category, offer, false);
            return prepareOfferForDelivery(offer, user.id, user);
        } catch (e) {
            throw new AppError(e);
        }
    },

    delete: async (id, user, categoryId) => {
        try {
            let category = await Category.findById(categoryId).exec();
            let offer = await getOfferFromCategory(id, categoryId);
            if (!offer) {
                throw new AppError(404, 'Offer does not exist.');
            }
            if (offer.createdBy.toString() !== user.id) {
                throw new AppError(400, 'Offer doesn\'t belong to user.');
            }

            let dbUser = await User.findById(user.id);
            let tags = offer.tags;

            dbUser = await cleanUpDashboardInfofields(offer, user);

            let idx = dbUser.createdOffers.findIndex((simpleOffer) => simpleOffer._id.toString() == offer._id.toString());
            if (idx != -1)
                dbUser.createdOffers.splice(idx, 1);
            
            dbUser.statistics.offerCount = dbUser.createdOffers.length;
            await dbUser.save();
            await saveChanges(category, offer, true);

            tags.forEach(async tag => {
                let tagDb = await tagController.findByName(tag);
                if (tagDb) {
                    if (tagDb.useCount <= 1)
                        await tagController.delete(tagDb._id);
                    else
                        tagController.update(tagDb._id, { useCount: tagDb.useCount - 1 });
                }
            });
        } catch (e) {
            throw new AppError(e);
        }
    },
    checkMinMaxAttendees,
    addEnrollment,
    removeEnrollment,
    acceptAttendee,
    rejectAttendee,

    setDefaultRequirementNames
};

async function cleanUpDashboardInfofields(offer, authUser) {
    let user;
    let idx;
    authUser = await User.findById(authUser.id);
    for (let enrollingAttendee of offer.enrollingAttendees) {
        user = await User.findById(enrollingAttendee.userId);
        if (user) {
            idx = user.offersEnrolledIn.findIndex((simpleOffer) => simpleOffer._id.toString() == offer._id.toString());
            if (idx != -1) {
                user.offersEnrolledIn.splice(idx, 1);
                await user.save();
            }   
        }   
    }

    for (let attendee of offer.attendees) {
        user = await User.findById(attendee);
        if (user) {
            idx = user.offersAttendeeIn.findIndex((simpleOffer) => simpleOffer._id.toString() == offer._id.toString());
            if (idx != -1) {
                user.offersAttendeeIn.splice(idx, 1);
                await user.save();
                authUser = updateTeachersStudents(authUser, user.id, false, true);
            }
        }
    }
    //await authUser.save();
    return authUser;
}

async function findAll(categoryId, authenticatedUser) {
    try {
        let category = await Category.findById(categoryId).exec();
        let offers = [];
        if (!category)
            throw new AppError(404, 'Category does not exist');
        if (category.offers) {
            for (let offer of category.offers) {
                offers.push(await prepareOfferForDelivery(offer, offer.createdBy, authenticatedUser));
            }
        }
        return offers;
    } catch (e) {
        throw new AppError(e);
    }
}

async function filter(categoryId, title, tags, authUser) {
    try {
        let category = await Category.findById(categoryId).exec();
        let offers = [];
        if (!category)
            throw new AppError(404, 'Category does not exist');
        if (category.offers) {
            for (let offer of category.offers) {
                if ((offer.tags && Array.isArray(offer.tags) && offer.tags.length > 0) || title.length > 0) {
                    let validOffer = false;
                    if (tags.length > 0) {
                        validOffer = offer.tags.some((el) => {
                            return tags.indexOf(el.toLowerCase()) !== -1;
                        });
                    }
                    if (!validOffer && title.length > 0)
                        validOffer = offer.title.toLowerCase().includes(title.toLowerCase());
                    if (validOffer) 
                        offers.push(await prepareOfferForDelivery(offer, offer.createdBy, authUser));   
                }
            }
        }
        return offers;
    } catch (e) {
        throw new AppError(e);
    }
}

async function findById(categoryId, offerId, delivery, authenticatedUser) {
    try {
        let category = await Category.findById(categoryId).exec();
        let result = undefined;
        if (!category)
            throw new AppError(404, 'Category does not exist');
        if (category.offers)
            result = category.offers.find(x => x._id == offerId);
        if (!result)
            throw new AppError(404, 'Offer does not exist');
        return delivery ? prepareOfferForDelivery(result, result.createdBy, authenticatedUser) : result;
    } catch (e) {
        throw new AppError(e);
    }
}

async function prepareOfferForDelivery(offer, createdBy, authenticatedUser) {
    let deliveredProps = [...deliveredProperties];
    let offeror = await User.findById(createdBy);
    let relation = setUserRelation(offer, authenticatedUser, offeror);
    if (createdBy.toString() === authenticatedUser.id.toString()) {
        deliveredProps.push('attendees', 'enrollingAttendees');
    } else if (relation === 'attendee') {
        deliveredProps.push('attendees');
    }
    var offerToDeliver = createObjectToDeliver(offer, deliveredProps);
    if (deliveredProps.includes('enrollingAttendees')) {
        let enrollingAttendees = [];
        for (let item of offer.enrollingAttendees) {
            let enrollment = {};
            let user = await User.findById(item.userId);
            if (user) {
                user = createObjectToDeliver(user, userProperties);
                user.pictureUrl = 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png';
                enrollment = {
                    user: user,
                    description: item.description
                };
                enrollingAttendees.push(enrollment);
            }
        }
        offerToDeliver.enrollingAttendees = enrollingAttendees;
    }
    offerToDeliver.relation = relation;
    offerToDeliver.attendeeCount = offer.attendees ? offer.attendees.length : 0;
    offerToDeliver.offeror = createObjectToDeliver(offeror, userProperties);
    offerToDeliver.offeror.pictureUrl = 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png';
    try {
        offerToDeliver.minAttendees = parseInt(offer.minAttendees);
        offerToDeliver.maxAttendees = parseInt(offer.maxAttendees);
    } catch (err) {
        throw new AppError(400, 'Wrong format of min or max attendees');
    }
    return offerToDeliver;
}

function setUserRelation(offer, authenticatedUser, offerCreator) {
    let relation = 'none';
    // if (authenticatedUser.id.toString() === offerCreator._id.toString())
    
    if (offer.attendees.map(x => x._id.toString()).includes(authenticatedUser.id))
        relation = 'attendee';
    
    if (offer.enrollingAttendees.map(x => x.userId).includes(authenticatedUser.id))
        relation = 'enrolled';
    
    if (offerCreator._id.toString() === authenticatedUser.id.toString())
        relation = 'offeror';
    
    return relation;
}

async function getOfferFromCategory(offerId, categoryId) {
    let category = await Category.findById(categoryId).exec();
    let offer = category.offers.find(element => element._id.toString() === offerId);
    return offer;
}

function checkMinMaxAttendees(min, max) {
    try {
        min = parseInt(min);
        max = parseInt(max);
    } catch (err) {
        throw new AppError(400, 'Wrong format of min or max attendees');
    }
    if (min && max) {
        if (min < -1 || max < -1)
            throw new AppError(400, 'MinAttendees or maxAttendees cannot be smaller than -1');
        if (min != -1 && max != -1 && min > max)
            throw new AppError(400, 'MinAttendees is greated than maxAttendees');
    }
    return true;
}

async function addEnrollment(offerId, authenticatedUser, categoryId, description) {
    if (description.length > 260)
        throw new AppError(400, 'Description for enrollment is too long. Maximum 160 letters!');    

    let category = await Category.findById(categoryId);
    if (!category)
        throw new AppError(404, 'Category does not exist.');
        
    let offer = await getOfferFromCategory(offerId, categoryId);
    if (!offer)
        throw new AppError(404, 'Offer does not exist.');
    
    if (authenticatedUser.id.toString() === offer.createdBy._id.toString())
        throw new AppError(400, 'User can\'t enroll himself.');
    
    if (offer.attendees.map(x => x._id).includes(authenticatedUser.id))
        throw new AppError(400, 'User is attendee.');
    
    if (!offer.enrollingAttendees.map(x => x.userId).includes(authenticatedUser.id)) {
        let user = await User.findById(authenticatedUser.id);
        if (!user)
            throw new AppError(404, 'No user for enrollment found.');
        let enrollment = {
            userId: user.id,
            description: description
        };
        offer.enrollingAttendees.push(enrollment);
        user.offersEnrolledIn.push({_id: offer._id, categoryId: categoryId}); //
        await user.save();
        await saveChanges(category, offer, false);
    }
    return {
        categoryId: category.id,
        categoryName: category.name,
        offer: offer,
        offerorId: offer.createdBy._id
    };
}

async function removeEnrollment(offerId, body, authenticatedUser, categoryId) {
    let category = await Category.findById(categoryId);
    if (!category)
        throw new AppError(404, 'Category does not exist.');
    
    let offer = await getOfferFromCategory(offerId, categoryId);
    if (!offer)
      throw new AppError(404, 'Offer does not exist.');

    let isCreator = false;
    if (authenticatedUser.id.toString() === offer.createdBy.toString())
        isCreator = true;
    
    if (isCreator) {
        await checkIdEnrollment(body.id);
    }
    
    let id = isCreator ? body.id : authenticatedUser.id;
    let index = offer.enrollingAttendees.map(x => x.userId).findIndex((element) => element._id.toString() === id.toString());
    if (!isCreator && (index < 0))
        throw new AppError(400, 'This user is not enrolled.');
        
    if (isCreator && (index < 0))
        throw new AppError(400, 'This user is not enrolled.');
    
    offer.enrollingAttendees.splice(index, 1);
    if(!isCreator)
        await removeEnrolledOfferFromUser(authenticatedUser.id, offer);
    else 
        await removeEnrolledOfferFromUser(body.id, offer);
        
    await saveChanges(category, offer, false);
}

async function removeEnrolledOfferFromUser(userId, offer) {
    let user = await User.findById(userId);
    if (!user)
        throw new AppError(404, 'Enrollment for user could not be removed; not found');
    let idx = user.offersEnrolledIn.findIndex((simpleOffer) => simpleOffer._id.toString() === offer._id.toString());
    if (idx != -1) {
        user.offersEnrolledIn.splice(idx, 1);
        await user.save();
    }
}

async function acceptAttendee(offerId, body, authenticatedUser, categoryId) {
    let category = await Category.findById(categoryId);
    if (!category)
        throw new AppError(404, 'Category does not exist.');

    let offer = await getOfferFromCategory(offerId, categoryId);
    if (!offer)
        throw new AppError(404, 'Offer does not exist.');
    
    if (authenticatedUser.id.toString() !== offer.createdBy.toString())
        throw new AppError(401, 'User is not authorized to perform this action.');
    
    let user = await checkIdEnrollment(body.id);
    let index = offer.enrollingAttendees.map(x => x.userId).findIndex((element) => element._id.toString() === user._id.toString());

    if (index < 0)
        throw new AppError(400, 'User is not marked as enrolling.');
    
    let hasCap = offer.maxAttendees >= 0;
    let idx = offer.attendees.findIndex((element) => element._id.toString() === user._id.toString());
    let isIncluded = idx >= 0;

    if (!isIncluded && hasCap) {
        if (!(offer.attendees.length < offer.maxAttendees))
            throw new AppError(400, 'Can\'t add user to attendees: Max Attendee cap is reached.');
    }
    if (!isIncluded) {
        await addUserToEligableToReviewArray(authenticatedUser, body.id);
        let dbUser = user;
        user = createObjectToDeliver(user, userProperties);
        user.pictureUrl = 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png';
        offer.attendees.push(user);
        offer.enrollingAttendees.splice(index, 1);
        await saveChanges(category, offer, false);

        let dbAuthenticatedUser = await User.findById(authenticatedUser.id);
        await updateTeachersStudents(dbAuthenticatedUser, body.id, true, false);

        dbUser.offersAttendeeIn.push({ _id: offer._id, categoryId: category._id });
        dbAuthenticatedUser.statistics.studentCount = dbAuthenticatedUser.students.length;

        //remove offersEnrolledIn from accepted user
        await removeEnrolledOfferFromUser(body.id, offer);

        await dbUser.save();
        await dbAuthenticatedUser.save();
    }
    return {
        categoryId: category.id,
        categoryName: category.name,
        offer: offer,
        offeror: user
    };
}

async function addUserToEligableToReviewArray(authUser, id) {
    let user = await User.findById(authUser.id);
    if (!user)
        throw new AppError(404, 'User could not be added. Not found.');
    
    if (user.eligableToReview.find(eId => eId.toString() === id.toString()) == undefined) {
       user.eligableToReview.push(id);
       await user.save(); 
    }
}

async function rejectAttendee(offerId, body, authenticatedUser, categoryId) {
    let category = await Category.findById(categoryId);
    if (!category)
        throw new AppError(404, 'Category does not exist.');
    let offer = await getOfferFromCategory(offerId, categoryId);
    if (!offer)
        throw new AppError(404, 'Offer does not exist.');
    
    if (!body.id || typeof body.id != 'string')
        throw new AppError(400, 'Invalid payload.');

    if (authenticatedUser.id.toString() !== offer.createdBy.toString() &&
        body.id.toString() !== authenticatedUser.id.toString())
            throw new AppError(401, 'User is not authorized to perform this action.');
    
    await checkIdEnrollment(body.id);
    let index = offer.attendees.findIndex((element) => element._id.toString() === body.id.toString());
    
    if (index >= 0) {
        offer.attendees.splice(index, 1);
        await saveChanges(category, offer, false);
        let isCreator = false;
        if (offer.createdBy.toString() == authenticatedUser.id.toString())
            isCreator = true;
        
        let dbAuthenticatedUser = await User.findById(authenticatedUser.id);
        let dbUser = await User.findById(body.id);
        let offerUser = await User.findById(offer.createdBy);

        if (isCreator)
            dbAuthenticatedUser = await updateTeachersStudents(dbAuthenticatedUser, body.id, false, true);
        else {
            offerUser = await updateStudentsTeachers(offerUser, dbAuthenticatedUser.id);
            await offerUser.save();
        }

        dbAuthenticatedUser = await User.findById(authenticatedUser.id);
        dbUser = await User.findById(body.id);

        let idx = dbUser.offersAttendeeIn.findIndex((simpleOffer) => simpleOffer._id.toString() == offer._id.toString());
        if (idx != -1)
            dbUser.offersAttendeeIn.splice(idx, 1);

        dbAuthenticatedUser.statistics.studentCount = dbAuthenticatedUser.students.length;
        await dbAuthenticatedUser.save();
        await dbUser.save();
    }
}

//action: true = add; false = remove
async function updateTeachersStudents(teacher, studentId, action, saveTeacher) {
    let student = await User.findById(studentId);
    if (!student)
        throw new AppError(404, 'Student could not be found');
    
    if (action) {
        let idx = teacher.students.findIndex((id) => id.toString() === studentId.toString());
        if(idx == -1)
            teacher.students.push(studentId);
        idx = student.teachers.findIndex((id) => id.toString() === teacher.id.toString());
        if(idx == -1)
            student.teachers.push(teacher.id);
    }
    else {
        let idx = teacher.students.findIndex((id) => id.toString() === studentId.toString());
        if (idx != -1)
            teacher.students.splice(idx, 1);
        idx = student.teachers.findIndex((id) => id.toString() === teacher.id.toString());
        if (idx != -1)
            student.teachers.splice(idx, 1);
    }

    if (saveTeacher)
        await teacher.save();
    await student.save();

    return teacher;
}

async function updateStudentsTeachers(teacher, studentId) {

    let student = await User.findById(studentId);
    let idx = student.teachers.findIndex((id) => id.toString() === teacher.id.toString());
        if (idx != -1)
            student.teachers.splice(idx, 1);
        idx = teacher.students.findIndex((id) => id.toString() === studentId.toString());
        if (idx != -1)
            teacher.students.splice(idx, 1);
            
    await teacher.save();
    return student;
}

async function checkIdEnrollment(userId) {
    if (!userId)
        throw new AppError(400, 'No id sent.');
        
    let user = await User.findById(userId);
    if (!user)
        throw new AppError(400, 'Id can\'t be resolved to a user.');
    
    return user;
}

async function saveChanges(category, offer, isDelete) {
    let index = category.offers.findIndex((element) => element._id.toString() === offer._id.toString());
    if (index < 0)
        throw new AppError(404, 'Offer does not exists');
            
    category.offers.splice(index, 1);
    if (!isDelete)
        category.offers.push(offer);
    await category.save();
}

function checkRequirementsValid(requirements) {
    if (requirements) {
        if (!Array.isArray(requirements))
            throw new AppError(400, 'Requirements is not an array.');
        
        let keys;
        requirements.forEach((element) => {
            keys = Object.keys(element);
            if (keys.length != 2 || !keys.includes('requirementName') || !keys.includes('requirementValue'))
                    throw new AppError(400, 'Wrong arguments in requirements.');
            
            if (!checkRequirementName(element.requirementName))
                throw new AppError(400, 'Requirement name is not valid.');
        });
    }
}

function checkRequirementName(requirementName) {
    if (defaultRequirementNames.length > 0)
        return defaultRequirementNames.includes(requirementName);
    return true;
}

function setDefaultRequirementNames(requirementNames) {
    defaultRequirementNames = requirementNames;
}

module.exports = OfferCtrl;
