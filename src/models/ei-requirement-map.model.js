const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { RelationTypes } = require('@/configs/enums.config');
const { descriptionLength } = require('@/configs/fields-length.config');
const { customIdRegex } = require('@/configs/regex.config');
const mongoose = require('mongoose');

const ExternalInterfaceRequirementMappingSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },

  externalInterfaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.EXTERNAL_INTERFACES,
    required: true
  },

  requirementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.REQUIREMENTS,
    required: true
  },

  relationType: {
    type: String,
    enum: Object.values(RelationTypes), // DEPENDS_ON, USES, etc.
    required: true
  },

  relationshipNotes: {
    type: String,
    trim: true,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max,
    default: null
  },

  createdBy: {
    type: String,
    required: true,
    match: customIdRegex
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
  }

}, { timestamps: true });

ExternalInterfaceRequirementMappingSchema.index(
  { projectId: 1, externalInterfaceId: 1, requirementId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

ExternalInterfaceRequirementMappingSchema.index({
  projectId: 1,
  externalInterfaceId: 1,
  isDeleted: 1
});

ExternalInterfaceRequirementMappingSchema.index({
  projectId: 1,
  requirementId: 1,
  isDeleted: 1
});

const ExternalInterfaceRequirementMappingModel = mongoose.model(DB_COLLECTIONS.EXTERNAL_INTERFACE_REQUIREMENT_MAPPINGS, ExternalInterfaceRequirementMappingSchema);

module.exports = {
    ExternalInterfaceRequirementMappingModel
}