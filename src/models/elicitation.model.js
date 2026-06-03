const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { PhaseDeletionReason, WorkflowModes, RequirementGovernanceModes } = require("@/configs/enums.config");
const { descriptionLength } = require("@/configs/fields-length.config");
const mongoose = require("mongoose");

const elicitationSchema = new mongoose.Schema({

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

  // People who can create/edit DRAFT requirements
  contributors: {
    type: [{
      type: String,
      match: customIdRegex
    }],
    default: []
  },

  // People who can add Review Notes in UNDER_REVIEW state (Moderation Mode only)
  reviewers: {
    type: [{
      type: String,
      match: customIdRegex
    }],
    default: []
  },

  // The final authority: Can ACCEPT, REJECT, or ISSUED requirements
  approvers: {
    type: [{
      type: String,
      match: customIdRegex
    }],
    default: []
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

  workflowMode: {
    type: String,
    enum: Object.values(WorkflowModes),
    default: WorkflowModes.OPEN
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

  isFrozen: {
    type: Boolean,
    default: false
  },

  requirementGovernanceMode: {
    type: String,
    enum: Object.values(RequirementGovernanceModes),
    default: RequirementGovernanceModes.PHASE
  }

}, { timestamps: true });

elicitationSchema.index({ projectId: 1, isDeleted: 1 });
elicitationSchema.index({
  projectId: 1,
  "version.major": 1,
  "version.minor": 1
},
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false
    }
  });

const ElicitationModel = mongoose.model(DB_COLLECTIONS.ELICITATIONS, elicitationSchema);

module.exports = {
  ElicitationModel
};