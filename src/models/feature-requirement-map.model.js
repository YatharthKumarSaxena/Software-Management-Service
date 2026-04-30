const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { RelationTypes, ContributionTypes, MappingStatuses } = require('@/configs/enums.config');
const { descriptionLength } = require('@/configs/fields-length.config');
const { customIdRegex } = require('@/configs/regex.config');
const { UnlinkReasonTypes } = require("@configs/reasons.config");
const mongoose = require('mongoose');

const FeatureRequirementMappingSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.PROJECTS,
        required: true,
        index: true
    },
    featureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.HIGH_LEVEL_FEATURES,
        required: true
    },
    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.REQUIREMENTS,
        required: true
    },
    relationType: {
        type: String,
        enum: Object.values(RelationTypes),
        required: true
    },
    contributionType: {
        type: String,
        enum: Object.values(ContributionTypes),
        default: ContributionTypes.SUPPORTING
    },
    relationshipNotes: {
        type: String,
        trim: true,
        default: null,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max
    },
    status: {
        type: String,
        enum: Object.values(MappingStatuses),
        default: MappingStatuses.LINKED
    },
    unlinkReason: {
        type: String,
        enum: Object.values(UnlinkReasonTypes),
        default: null
    },
    unlinkDescription: {
        type: String,
        trim: true,
        default: null,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max
    },
    unlinkedAt: {
        type: Date,
        default: null
    },
    unlinkedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },
    linkedBy: {
        type: String,
        match: customIdRegex,
        required: true
    },
    linkedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: { type: String, required: true, match: customIdRegex },
    updatedBy: { type: String, match: customIdRegex, default: null }
}, {
    timestamps: true
});

// 🧠 INDEX 1: Compound Unique Index
// Ek hi requirement aur feature ka same combination do baar map na ho (bina delete hue)
FeatureRequirementMappingSchema.index(
  { projectId: 1, featureId: 1, requirementId: 1 },
  { unique: true}
);

FeatureRequirementMappingSchema.index({
  projectId: 1,
  featureId: 1
});

FeatureRequirementMappingSchema.index({
  projectId: 1,
  requirementId: 1
});

const FeatureRequirementMappingModel = mongoose.model(
    DB_COLLECTIONS.FEATURE_REQUIREMENT_MAPPINGS, // Ensure this exists in your config
    FeatureRequirementMappingSchema
);

module.exports = {
    FeatureRequirementMappingModel
};