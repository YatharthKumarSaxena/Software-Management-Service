const mongoose = require("mongoose");
const { firstNameLength } = require("@configs/fields-length.config");
const { FirstNameFieldSetting, ClientRoleTypes } = require("@configs/enums.config");
const { firstNameRegex, customIdRegex } = require("@configs/regex.config");
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

    role: {
        type: String,
        enum: Object.values(ClientRoleTypes),
        required: true
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

});

module.exports = {
    ClientModel: mongoose.model(DB_COLLECTIONS.CLIENTS, clientSchema)
};