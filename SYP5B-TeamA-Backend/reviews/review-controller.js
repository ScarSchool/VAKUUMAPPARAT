const AppError = require('../errorhandling/error-model');
const mongoose = require('mongoose');
const User = require('../user/user-model');

const { createPayloadCheck, createObjectToDeliver } = require('../commons/controller-helpers');

const requiredProperties = ['content', 'rating'];
// id allowed at updates
// if id is sent with a create / post request, an exception will be fired
const allowedProperties = ['title', 'content', 'rating', 'answers'];
const deliveredProperties = ['_id', 'content', 'rating', 'authorId', 'timestamp', 'edited', 'title', 'author', 'answers'];
const checkPayloadProps = createPayloadCheck(requiredProperties, allowedProperties);
const userProperties = ['_id', 'firstname', 'lastname'];

const reviewCtrl = {
  create: async (user, review, reviewer) => {
    try {
        checkPayloadProps(review, 'create');
        if (isAuthorReviewedUser(user, reviewer))
        throw new AppError(400, 'You cannot review your own content.');
        
        if (!(isEligableToReview(user, reviewer) && hasNotReviewedYet(user, reviewer)))
        throw new AppError(400, 'You are not eligable to write a review');
      
        if (Object.keys(review).includes('rating')) {
          if (typeof review.rating != 'number' || review.rating > 5 || review.rating < 1)
            throw new AppError(400, 'Rating has to be a number between 1 and 5');
        }
      
        let currentReview = review;
        currentReview.authorId = reviewer.id;
        currentReview._id = mongoose.Types.ObjectId();
        currentReview.timestamp = Date.now();
        if (!review.answers)
          review.answers = [];
        user.reviews.push(review);
        await user.save();
        return await createReviewsToDeliver(currentReview);
    } catch (e) {
      throw new AppError(e);
    }
  },
  findAll: async (user) => {
    try {
      return await createReviewsToDeliver(user.reviews);
    } catch (e) {
      throw new AppError(e);
    }
  },
  findById: async (user, reviewId, delivery) => {
    try {
      let review = user.reviews.find((review) => review._id.toString() === reviewId);
      if (!review)
        throw new AppError(404, 'Review not found.');
      return delivery ? await createReviewsToDeliver(review) : review;
    } catch (e) {
        throw new AppError(e);
    }
  },
  update: async (user, newValues, reviewer, reviewId) => {
    try {
      checkPayloadProps(newValues, 'update');

      let currentReview = await findReviewByIdAndGetIndex(user, reviewId);
      if (!currentReview)
        throw new AppError(404, 'Review not found.');
      let reviewIdx = currentReview.index;
      delete currentReview.index;

      if (reviewer.id.toString() !== currentReview.authorId.toString())
        throw new AppError(400, 'You are not the owner of this review.');
      
      if (Object.keys(newValues).includes('rating')) {
        if (typeof newValues.rating != 'number' || newValues.rating > 5 || newValues.rating < 1)
          throw new AppError(400, 'Rating has to be a number sbetween 1 and 5');
      }

      for (let key in newValues) {
        currentReview[key] = newValues[key];
      }

      currentReview.timestamp = new Date().toISOString();
      currentReview.edited = true;
      user.reviews.splice(reviewIdx, 1);
      user.reviews.push(currentReview);
      await user.save();
      currentReview = currentReview.toObject();
      return await createReviewsToDeliver(currentReview);
    } catch (e) {
      throw new AppError(e);
    }
  },
  delete: async (user, reviewId, reviewer) => {
    try {
      let review = findReviewByIdAndGetIndex(user, reviewId, false);
      if (!review)
        throw new AppError(404, 'Review not found.');
      
      if (user.id.toString() != reviewer.id.toString() && review.authorId.toString() != reviewer.id.toString())
        throw new AppError(400, 'You are not allowed to delete this review.');
      
      user.reviews.splice(review.index, 1);
      delete user.index;
      await user.save();
    } catch (e) {
      throw new AppError(e);
    }
  },
  createAnswer,
  updateAnswer,
  deleteAnswer,
  prepareReviewDeliveryFields,
  calculateRatingAverage,
  determineCanReview,
  createReviewsToDeliver
};

function isAuthorReviewedUser(user, reviewer) {
    return user.id.toString() === reviewer.id.toString();
}

//this function finds a review per id and adds the index of the review in the reviews array to the review object
function findReviewByIdAndGetIndex(user, reviewId) {
  let reviewWIndex = user.reviews.find((review, idx) => {
    if (review.id.toString() === reviewId.toString()) {
      review.index = idx;
      return review;
    }
  });
  return reviewWIndex;
}

function findAnswerByIdAndGetIndex(review, answerId) {
  let answerWIndex = review.answers.find((answer, idx) => {
    if (answer._id.toString() === answerId.toString()) {
      answer.index = idx;
      return answer;
    }
  });
  return answerWIndex;
}

async function createAnswer(user, reviewId, author, content) {
  let answer = {
    authorId: author.id,
    content: content,
    edited: false,
    timestamp: Date.now()
  };
  if (content.length <= 0)
    throw new AppError(400, 'Content mus be greater than 0');
  let review = await reviewCtrl.findById(user, reviewId, false);
  if (!isEligableToReview(user, author) && user.id.toString() != author.id.toString())
    throw new AppError(400, 'You are not eligable to write a review answer');
  if (!review.answers)
    review.answers = [];
  review.answers.push(answer);
  await user.save();
  return createReviewsToDeliver(review);
}

async function updateAnswer(user, reviewId, answerId, author, newContent) {
  if (newContent.length <= 0)
    throw new AppError(400, 'Content mus be greater than 0');
  let review = await reviewCtrl.findById(user, reviewId, false);
  if (!review)
    throw new AppError(404, 'No review with given id found');
  if (!review.answers)
    review.answers = [];
  let answer = review.answers.find((answer) => answer._id.toString() === answerId);
  if (!answer)
    throw new AppError(404, 'No answer with given id found');
  if (answer.authorId.toString() != author.id)
    throw new AppError(400, 'You are not allowed to edit this review answer');
  answer.content = newContent;
  answer.edited = true;
  await user.save();
  return await createReviewsToDeliver(review);
}

async function deleteAnswer(user, reviewId, answerId, author) {
  let review = await reviewCtrl.findById(user, reviewId, false);
  if (!review)
    throw new AppError(404, 'No review with given id found');
  if (!review.answers)
    review.answers = [];
  let answer = findAnswerByIdAndGetIndex(review, answerId);
  if (!answer)
    throw new AppError(404, 'No answer with given id found');
  if (user.id.toString() != author.id.toString() && answer.authorId.toString() != author.id.toString())
    throw new AppError(400, 'You are not allowed to delete this review answer.');
  
  review.answers.splice(answer.index, 1);
  delete answer.index;
  await user.save();
}

async function createReviewsToDeliver(reviews) {
  let reviewToDeliver = undefined;  
  if (Array.isArray(reviews)) {
    var reviewsToDeliver = [];
    for (let review of reviews) {
      reviewToDeliver = await replaceAuthorIdWithObject(review);
      reviewToDeliver.answers = await createAnswersToDeliver(reviewToDeliver);
      reviewsToDeliver.push(createObjectToDeliver(reviewToDeliver, deliveredProperties));
    }
    return reviewsToDeliver;
  } else {
    reviewToDeliver = await replaceAuthorIdWithObject(reviews);
    reviewToDeliver.answers = await createAnswersToDeliver(reviewToDeliver);
    return createObjectToDeliver(reviewToDeliver, deliveredProperties);
  }
}

async function createAnswersToDeliver(review) {
  let answersToDeliver = [];
  if (review.answers) {
    let users = [];
    for (let answer of review.answers) {
      let user = users.find(x => x._id.toString() == answer.authorId.toString());
      if (!user)
        user = await User.findById(answer.authorId, '_id firstname lastname');
      if (user) {
        user = createObjectToDeliver(user, userProperties);
        user.pictureUrl = 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png';
        answersToDeliver.push({
          _id: answer._id,
          user: user,
          content: answer.content,
          edited: answer.edited,
          timestamp: answer.timestamp
        });
        users.push(user);
      }
    }
  }
  return answersToDeliver;
}

async function replaceAuthorIdWithObject(review) {
  if (review.toObject)
    review = review.toObject();
  let user = await User.findById(review.authorId, '_id firstname lastname');
  if (user) {
    user = createObjectToDeliver(user, userProperties);
    user.pictureUrl = 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png';
    delete review.authorId;
    review.author = user;
  }
  return review;
}

function prepareReviewDeliveryFields(user, authUser) {
  if (user._id.toString() === authUser.id.toString()) {
    user.myReview = null;
    return user;
  }
		
	let myReview = user.reviews.find((review, idx) => {
		if (review.authorId.toString() === authUser.id.toString()){
			review.idx = idx;
			return review;
		}
	});
	if (myReview) {
		user.reviews.splice(myReview.idx, 1);
		delete myReview.idx;
		user.myReview = myReview;
	}
	else {
		user.myReview = null;
	}
	return user;
}

async function calculateRatingAverage(user) {
	let kumRating = 0;
	user.reviews.forEach(review => kumRating += review.rating);
	let avgRating = isNaN(kumRating / user.reviews.length) ? 0 : kumRating / user.reviews.length;
	user.statistics.averageRating = avgRating;
  user.statistics.reviewCount = user.reviews.length;
  
  //update db statistics
  let dbUser = await User.findById(user._id);
  dbUser.statistics.averageRating = avgRating;
  dbUser.statistics.reviewCount = user.reviews.length;
  await dbUser.save();
}

function determineCanReview(user, authUser) {
  let canReview = false;
  if (user._id.toString() === authUser.id.toString()) {
    user.canReview = canReview;
    return;
  }
	
	if (isEligableToReview(user, authUser))
    canReview = true;
	
	user.canReview = canReview;
}

function isEligableToReview(user, authUser) {
	return user.eligableToReview.find(id => id.toString() === authUser.id.toString()) != null;
}

function hasNotReviewedYet(user, authUser) {
	return user.reviews.find(review => review.authorId.toString() == authUser.id.toString()) == undefined;
}

module.exports = reviewCtrl;