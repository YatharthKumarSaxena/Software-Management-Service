const { ClientRoleTypes, Phases, StakeholderDeletionReason, ProjectRoleTypes } = require("@/configs/enums.config");
const { customIdRegex, mongoIdRegex } = require("@/configs/regex.config");
const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { descriptionLength } = require("@/configs/fields-length.config");

const stakeholderSchema = new mongoose.Schema({

  userId: {
    type: String,
    immutable: true,
    required: true,
    match: customIdRegex,
    index: true
  },

  organizationId: {
    type: String,
    match: mongoIdRegex,
    default: null,
    index: true
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },

  role: {
    type: String,
    enum: [...Object.values(ClientRoleTypes), ...Object.values(ProjectRoleTypes)],
    required: true
  },

  createdBy: {
    type: String,
    match: customIdRegex
  },

  updatedBy: {
    type: String,
    default: null,
    match: customIdRegex
  },

  phase: {
    type: String,
    enum: Object.values(Phases),
    default: Phases.INCEPTION,
    immutable: true,
    required: true
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
    default: null,
    match: customIdRegex
  },

  deletionReasonType: {
    type: String,
    default: null, 
    enum: Object.values(StakeholderDeletionReason)
  },

  deletionReasonDescription: {
    type: String,
    default: null,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max
  }

}, {
  timestamps: true,
  versionKey: false,
  collection: DB_COLLECTIONS.STAKEHOLDERS
});

stakeholderSchema.index(
  { userId: 1, projectId: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const StakeholderModel = mongoose.model(DB_COLLECTIONS.STAKEHOLDERS, stakeholderSchema);

module.exports = {
  StakeholderModel
};