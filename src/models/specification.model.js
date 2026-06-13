const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { PhaseDeletionReason, PhaseStatus } = require("@/configs/enums.config");
const { descriptionLength } = require("@/configs/fields-length.config");
const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema({

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
  },

  updatedBy: {
    type: String,
    match: customIdRegex
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
    enum: Object.values(PhaseDeletionReason),
    default: null
  },

  deletionReasonDescription: {
    type: String,
    default: null,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max
  },

  phaseStatus: {
    type: String,
    enum: Object.values(PhaseStatus),
    default: PhaseStatus.OPEN
  }

}, { timestamps: true });

specificationSchema.index({ projectId: 1, isDeleted: 1 });
specificationSchema.index({
  projectId: 1,
  "version.major": 1,
  "version.minor": 1
}, { unique: true, partialFilterExpression: { isDeleted: false } });

const SpecificationModel = mongoose.model(DB_COLLECTIONS.SPECIFICATIONS, specificationSchema);

module.exports = {
  SpecificationModel
};
