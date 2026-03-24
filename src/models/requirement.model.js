
const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { RequirementTypes, RequirementSources, RequirementStatuses } = require('@/configs/enums.config');
const { descriptionLength, titleLength } = require('@/configs/fields-length.config');
const { customIdRegex } = require('@/configs/regex.config');
const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
    elicitationId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.ELICITATIONS, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.PROJECTS, required: true },
    title: { type: String, trim: true, minlength: titleLength.min, maxlength: titleLength.max, required: true },
    description: { type: String, trim: true, default: null, minlength: descriptionLength.min, maxlength: descriptionLength.max },
    type: { type: String, enum: Object.values(RequirementTypes), default: RequirementTypes.FUNCTIONAL },
    parentFeatureId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.HIGH_LEVEL_FEATURES, default: null },
    status: { type: String, enum: Object.values(RequirementStatuses), default: RequirementStatuses.DRAFT },
    source: { type: String, enum: Object.values(RequirementSources), default: RequirementSources.MANUAL },
    createdBy: { type: String, required: true, match: customIdRegex },
    updatedBy: { type: String, match: customIdRegex, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, match: customIdRegex, default: null },
    lastDroppedAt: { type: Date, default: null },
    lastDroppedBy: { type: String, match: customIdRegex, default: null },
    lastDropReason: { type: String, trim: true, minlength: descriptionLength.min, maxlength: descriptionLength.max, default: null }
}, {
    timestamps: true
});

RequirementSchema.index({ elicitationId: 1, title: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
RequirementSchema.index({ elicitationId: 1, isDeleted: 1 });
RequirementSchema.index({ elicitationId: 1, parentFeatureId: 1, isDeleted: 1 });
RequirementSchema.index({ elicitationId: 1, status: 1, isDeleted: 1 });
RequirementSchema.index({ elicitationId: 1, createdAt: -1, isDeleted: 1 });

const RequirementModel = mongoose.model(DB_COLLECTIONS.REQUIREMENTS, RequirementSchema);

module.exports = {
    RequirementModel
}