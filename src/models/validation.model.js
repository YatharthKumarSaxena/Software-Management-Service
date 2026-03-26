const mongoose = require("mongoose");
const { descriptionLength } = require("@/configs/fields-length.config");
const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { PhaseDeletionReason, ValidationPhaseStatus } = require("@/configs/enums.config");

const validationSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
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

  status : { 
    type: String,
    enum: Object.values(ValidationPhaseStatus),
    default: ValidationPhaseStatus.DRAFT
  },

  isApproved: {
    type: Boolean,
    default: false
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
  }

}, { timestamps: true });

const ValidationModel = mongoose.model(DB_COLLECTIONS.VALIDATIONS, validationSchema);

module.exports = {
  ValidationModel
};