const mongoose = require("mongoose");

const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { customIdRegex } = require("@/configs/regex.config");
const { titleLength, descriptionLength } = require("@/configs/fields-length.config");
const { IdeaStatuses, RejectedIdeaReasonTypes, DeferredIdeaReasonTypes } = require("@/configs/enums.config");

const ideaSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
        minlength: titleLength.min,
        maxlength: titleLength.max
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.PROJECTS,
        required: true,
        index: true
    },

    status: {
        type: String,
        enum: Object.values(IdeaStatuses),
        default: IdeaStatuses.PENDING
    },

    rejectedReasonType: {
        type: String,
        enum: Object.values(RejectedIdeaReasonTypes),
        default: null
    },

    deferredReasonType: {
        type: String,
        enum: Object.values(DeferredIdeaReasonTypes),
        default: null
    },

    notAcceptedReasonDescription: {
        type: String,
        trim: true,
        default: null,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max
    },

    decidedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    decidedAt: {
        type: Date,
        default: null
    },

    /* ---------------- Status ---------------- */

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

    /* ---------------- Admin Info ---------------- */

    createdBy: {
        type: String,
        required: true,
        match: customIdRegex
    },

    updatedBy: {
        type: String,
        match: customIdRegex,
        default: null
    }

}, { timestamps: true, versionKey: false });

/* ---------------- Index ---------------- */

// Avoid duplicate ideas (same title in active records)
ideaSchema.index(
    { title: 1, projectId: 1, isDeleted: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

/* ---------------- Validations ---------------- */

ideaSchema.pre("validate", function () {

    // deletedAt & deletedBy together
    if ((this.deletedAt && !this.deletedBy) || (!this.deletedAt && this.deletedBy)) {
        throw new Error("deletedAt and deletedBy must be provided together.");
    }

    if (this.status === IdeaStatuses.REJECTED) {
        if (!this.rejectedReasonType || this.deferredReasonType) {
            throw new Error("Only rejectedReasonType is allowed when idea is REJECTED.");
        }
    }

    if (this.status === IdeaStatuses.DEFERRED) {
        if (!this.deferredReasonType || this.rejectedReasonType) {
            throw new Error("Only deferredReasonType is allowed when idea is DEFERRED.");
        }
    }

    if (this.status === IdeaStatuses.ACCEPTED) {
        if (this.rejectedReasonType || this.deferredReasonType || this.notAcceptedReasonDescription) {
            throw new Error("No rejection/deferred fields allowed when idea is ACCEPTED.");
        }
    }

});

module.exports = {
    IdeaModel: mongoose.model(DB_COLLECTIONS.IDEAS, ideaSchema)
};