const { ClientRoleTypes, Phases, AdminRoleTypes } = require("@/configs/enums.config");
const { customIdRegex } = require("@/configs/regex.config");
const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

const stakeholderSchema = new mongoose.Schema({

  stakeholderId: {
    type: String,
    immutable: true,
    required: true,
    match: customIdRegex,
    index: true
  },

  projectId: {
    type: String,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },

  role: {
    type: String,
    enum: [...Object.values(ClientRoleTypes), ...Object.values(AdminRoleTypes)],
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
  }

}, {
  timestamps: true,
  versionKey: false,
  collection: DB_COLLECTIONS.STAKEHOLDERS
});

stakeholderSchema.index(
  { stakeholderId: 1, projectId: 1 },
  { unique: true }
);

const StakeholderModel = mongoose.model(DB_COLLECTIONS.STAKEHOLDERS, stakeholderSchema);

module.exports = {
  StakeholderModel
};