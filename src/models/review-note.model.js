// models/review-note.model.js

const mongoose = require('mongoose');
const { descriptionLength } = require('@/configs/fields-length.config');
const { customIdRegex } = require('@/configs/regex.config');
const { ReviewNoteEntityTypes } = require('@/configs/enums.config');
const { DB_COLLECTIONS } = require('@/configs/db-collections.config');

/**
 * Lazy-loads the Mongoose model for a given entity type.
 * Used to validate that entity type and ID match during review note creation
 * without causing circular dependencies during application startup.
 */
const ENTITY_TYPE_TO_MODEL = (entityType) => {
    // Map the enum to the database collection string instead of the Model file
    const collectionMapping = {
        [ReviewNoteEntityTypes.REQUIREMENT]: DB_COLLECTIONS.REQUIREMENTS,
        [ReviewNoteEntityTypes.SCOPE]: DB_COLLECTIONS.SCOPES,
        [ReviewNoteEntityTypes.INCEPTION]: DB_COLLECTIONS.INCEPTIONS,
        [ReviewNoteEntityTypes.HIGH_LEVEL_FEATURE]: DB_COLLECTIONS.HIGH_LEVEL_FEATURES
    };

    const collectionName = collectionMapping[entityType];
    
    if (!collectionName) {
        throw new Error(`Invalid ReviewNote entityType: ${entityType}`);
    }

    // Fetch the model directly from Mongoose's internal registry
    return mongoose.model(collectionName);
};

/**
 * ReviewNote Schema
 * Stores review notes/comments on requirements, diagrams, specifications, etc.
 * 
 * Each review note can be associated with different entity types:
 * - REQUIREMENT: Main requirement review
 * - DIAGRAM: Associated diagram/wireframe review
 * - SPECIFICATION: Technical specification review
 * - HIGH_LEVEL_FEATURE: HLF mapping review
 * - EXTERNAL_INTERFACE: External interface/API review
 */
const ReviewNoteSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.PROJECTS,
        required: true,
        immutable: true
    },
    entityType: {
        type: String,
        enum: Object.values(ReviewNoteEntityTypes),
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'entityType',
        required: true,
        immutable: true
    },
    description: {
        type: String,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max,
        required: true,
        trim: true
    },
    createdBy: {
        type: String,
        match: customIdRegex,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: null
    },
    updatedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        type: String,
        match: customIdRegex,
        default: null
    }
}, {
    timestamps: true,
    collection: DB_COLLECTIONS.REVIEW_NOTES || 'review-notes'
});

// Indexes for efficient querying
ReviewNoteSchema.index({ projectId: 1, isDeleted: 1 });
ReviewNoteSchema.index({ projectId: 1, entityType: 1, isDeleted: 1 });
ReviewNoteSchema.index({ entityId: 1, isDeleted: 1 });
ReviewNoteSchema.index({ entityId: 1, entityType: 1, isDeleted: 1 });
ReviewNoteSchema.index({ createdBy: 1, isDeleted: 1 });
ReviewNoteSchema.index({ createdAt: -1, isDeleted: 1 });
ReviewNoteSchema.index({ projectId: 1, createdAt: -1, isDeleted: 1 });
ReviewNoteSchema.index({ entityId: 1, createdAt: -1, isDeleted: 1 });

const ReviewNoteModel = mongoose.model(DB_COLLECTIONS.REVIEW_NOTES || 'ReviewNote', ReviewNoteSchema);

module.exports = { ReviewNoteModel, ReviewNoteSchema, ENTITY_TYPE_TO_MODEL };
