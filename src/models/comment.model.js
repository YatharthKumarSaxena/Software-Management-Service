const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { CommentSpecifiedEntityTypes, CommentEntityTypes } = require('@/configs/enums.config');
const { descriptionLength } = require('@/configs/fields-length.config');
const { customIdRegex } = require('@/configs/regex.config');
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    entityType: { type: String, enum: Object.values(CommentEntityTypes), required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.PROJECTS, required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityType', required: true },
    subEntityType: {
        type: String,
        enum: [...Object.values(CommentSpecifiedEntityTypes), null],
        default: null
    },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.COMMENTS, default: null },
    commentText: { type: String, trim: true, minlength: descriptionLength.min, maxlength: descriptionLength.max, required: true },
    createdBy: { type: String, required: true, match: customIdRegex },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, match: customIdRegex, default: null },
    deletedReason: { type: String, trim: true, minlength: descriptionLength.min, maxlength: descriptionLength.max, default: null }
}, {
    timestamps: true
});

CommentSchema.index({ entityType: 1, entityId: 1, isDeleted: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1, isDeleted: 1 });
CommentSchema.index({ parentCommentId: 1, isDeleted: 1, createdAt: 1 });

const CommentModel = mongoose.model(DB_COLLECTIONS.COMMENTS, CommentSchema);

module.exports = {
    CommentModel
}