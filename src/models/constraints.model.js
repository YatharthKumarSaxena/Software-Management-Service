const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { ConstraintTypes, ApplicabilityTypes } = require("@/configs/enums.config");
const { customIdRegex } = require("@/configs/regex.config");
const { descriptionLength, titleLength } = require("@/configs/fields-length.config");
const mongoose = require("mongoose");

const ConstraintSchema = new mongoose.Schema({
    inceptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.INCEPTIONS,
        required: true
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.PROJECTS,
        required: true
    },

    featureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.HIGH_LEVEL_FEATURES,
        default: null
    },

    type: {
        type: String,
        enum: Object.values(ConstraintTypes),
        required: true
    },

    title: {
        type: String,
        trim: true,
        required: true,
        minlength: titleLength.min,
        maxlength: titleLength.max,
        lowercase: false
    },

    description: {
        type: String,
        trim: true,
        default: null,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max
    },

    category: {
        type: String,
        trim: true,
        default: ApplicabilityTypes.GLOBAL,
        enum: Object.values(ApplicabilityTypes)
    },

    sequence: {
        type: Number,
        required: true,
        min: 1
    },

    id: {
        type: String,
        required: true,
        trim: true
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

}, {
    timestamps: true
});

/* ---------------- Indexes ---------------- */

ConstraintSchema.index(
    { projectId: 1, title: 1 },
    {
        unique: true,
        collation: { locale: "en", strength: 2 },
        partialFilterExpression: { isDeleted: false }
    }
);

ConstraintSchema.index(
    { projectId: 1, id: 1 },
    {
        unique: true
    }
);

ConstraintSchema.pre("validate", function () {
    if (
        this.category === ApplicabilityTypes.LOCAL &&
        !this.featureId
    ) {
        throw new Error("featureId is required for LOCAL constraints.");
    }

    if (
        this.category === ApplicabilityTypes.GLOBAL &&
        this.featureId
    ) {
        throw new Error("featureId must be null for GLOBAL constraints.");
    }

    if ((this.deletedAt && !this.deletedBy) ||
        (!this.deletedAt && this.deletedBy)) {
        throw new Error("deletedAt and deletedBy must be provided together.");
    }
});

const ConstraintModel = mongoose.model(
    DB_COLLECTIONS.CONSTRAINTS,
    ConstraintSchema
);

module.exports = {
    ConstraintModel
};