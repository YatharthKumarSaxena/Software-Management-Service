const mongoose = require("mongoose");
const { firstNameLength } = require("@configs/fields-length.config");
const { FirstNameFieldSetting, ClientTypes } = require("@configs/enums.config");
const { firstNameRegex, customIdRegex, mongoIdRegex } = require("@configs/regex.config");
const { FIRST_NAME_SETTING } = require("@configs/security.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

/* Client Schema */
const clientSchema = new mongoose.Schema({

    clientId: {
        type: String,
        unique: true,
        immutable: true,
        required: true,
        match: customIdRegex,
        index: true
    },

    firstName: {
        type: String,
        trim: true,
        minlength: firstNameLength.min,
        maxlength: firstNameLength.max,
        match: firstNameRegex
    },

    /* ---------------- Activation Lifecycle ---------------- */

    isActive: {
        type: Boolean,
        default: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    isSuspended: {
        type: Boolean,
        default: false
    },

    /* ---------------- Block Lifecycle ---------------- */

    isBlocked: {
        type: Boolean,
        default: false
    },

    /* ---------------- Governance Hierarchy ---------------- */

    clientType: {
        type: String,
        enum: Object.values(ClientTypes),
        default: ClientTypes.INDIVIDUAL
    },

    organizationIds: {
        type: [{
            type: String,
            match: mongoIdRegex
        }],
        default: [],
        validate: {
            validator: arr => new Set(arr).size === arr.length,
            message: "Duplicate organizationIds are not allowed."
        }
    }

}, { timestamps: true, versionKey: false });


clientSchema.pre("validate", function () {

    if (
        FIRST_NAME_SETTING === FirstNameFieldSetting.DISABLED &&
        this.firstName != null
    ) {
        this.invalidate(
            "firstName",
            "First Name field is disabled and must not be provided."
        );
    }

    else if (FIRST_NAME_SETTING === FirstNameFieldSetting.MANDATORY) {
        if (!this.firstName || this.firstName.trim().length === 0) {
            this.invalidate(
                "firstName",
                "First Name is required as per configuration."
            );
        }
    }

    // Organization validation
    if (this.clientType !== ClientTypes.INDIVIDUAL) {
        if (!this.organizationIds || this.organizationIds.length === 0) {
            this.invalidate(
                "organizationIds",
                "At least one organizationId is required when clientType is not INDIVIDUAL."
            );
        }
    }

    if (
        this.clientType === ClientTypes.INDIVIDUAL &&
        this.organizationIds &&
        this.organizationIds.length > 0
    ) {
        this.invalidate(
            "organizationIds",
            "Individual clients cannot belong to organizations."
        );
    }

});

module.exports = {
    ClientModel: mongoose.model(DB_COLLECTIONS.CLIENTS, clientSchema)
};