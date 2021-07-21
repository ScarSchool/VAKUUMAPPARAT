const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema;
const notificationSchema = require('./../notifications/notification-model')
  .schema;
const reviewSchema = require('../reviews/review-model').schema;

const userSchema = new Schema({
  // attributes
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    enum: ['active', 'inactive'],
    required: true,
    default: 'active',
  },
  generalInfo: {
    visibility: {
      type: String,
      enum: ['public', 'private'],
      required: true,
      default: 'public',
    },
    biography: {
      type: String,
      required: false,
      default: '',
    },
  },
  privateInfo: {
    visibility: {
      type: String,
      enum: ['public', 'private'],
      required: true,
      default: 'public',
    },
    phoneNumber: {
      type: String,
      required: false,
      default: '',
    },
    //username: {}
  },
  statistics: {
    averageRating: {
      type: Number,
      required: true,
      default: 0,
    },
    reviewCount: {
      type: Number,
      required: true,
      default: 0,
    },
    studentCount: {
      type: Number,
      required: true,
      default: 0,
    },
    offerCount: {
      type: Number,
      required: true,
      default: 0,
    },
    likeCount: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  additionalInfo: {
    visibility: {
      type: String,
      enum: ['public', 'private'],
      required: true,
      default: 'public',
    },
    jobTitle: {
      type: String,
      required: false,
      default: '',
    },
    education: {
      type: String,
      required: false,
      default: '',
    },
    residency: {
      type: String,
      required: false,
      default: '',
    },
  },
  notifications: [
    {
      type: notificationSchema,
      required: false,
      default: [],
    },
  ],
  likedOfferors: [
    {
      type: ObjectId,
      default: [],
      required: true,
    },
  ],
  reviews: [
    {
      type: reviewSchema,
      required: false,
      default: [],
    },
  ],
  eligableToReview: [
    {
      type: ObjectId,
      default: [],
      required: true,
    },
  ],
  students: [
    {
      type: ObjectId,
      default: [],
      required: true,
    },
  ],
  teachers: [
    {
      type: ObjectId,
      default: [],
      required: true,
    },
  ],
  offersEnrolledIn: [
    {
      _id: {
        type: ObjectId,
        required: true,
      },
      categoryId: {
        type: ObjectId,
        required: true,
      }
    }
  ],
  createdOffers: [
    {
      _id: {
        type: ObjectId,
        required: true,
      },
      categoryId: {
        type: ObjectId,
        required: true,
      }
    }
  ],
  offersAttendeeIn: [
    {
      _id: {
        type: ObjectId,
        required: true,
      },
      categoryId: {
        type: ObjectId,
        required: true,
      }
    }
  ]
});

let userModel = mongoose.model('users', userSchema);

module.exports = userModel;
