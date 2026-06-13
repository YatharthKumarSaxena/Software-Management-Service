const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { descriptionLength, productVisionLength } = require("@/configs/fields-length.config");
const { InceptionDeletionReason, PhaseStatus } = require("@/configs/enums.config");
const mongoose = require("mongoose");

const inceptionSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },
  
  meetingIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.MEETINGS
  }],

  allowParallelMeetings: {
    type: Boolean,
    default: false
  },

  productVision: {
    type: String,
    trim: true,
    minlength: productVisionLength.min,
    maxlength: productVisionLength.max,
    default: null
  },

  version: {
    major: {
      type: Number, // equivalent to cycleNumber
      default: 1
    },
    minor: {
      type: Number, // updates inside cycle
      default: 0
    }
  },

  createdBy: {
    type: String,
    match: customIdRegex,
    required: true
  },

  updatedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  },

  deletedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  deletionReasonType: {
    type: String,
    enum: Object.values(InceptionDeletionReason),
    default: null
  },

  deletionReasonDescription: {
    type: String,
    trim: true,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max,
    default: null
  },

  phaseStatus: {
    type: String,
    enum: Object.values(PhaseStatus),
    default: PhaseStatus.OPEN
  }

}, { timestamps: true });

inceptionSchema.index(
  {
    projectId: 1,
    "version.major": 1,
    "version.minor": 1
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false
    }
  }
);
inceptionSchema.index({ projectId: 1, isDeleted: 1 });

const InceptionModel = mongoose.model(DB_COLLECTIONS.INCEPTIONS, inceptionSchema);

module.exports = {
  InceptionModel
};
