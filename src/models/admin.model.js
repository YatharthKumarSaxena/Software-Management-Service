const mongoose = require("mongoose");
const { firstNameLength } = require("@configs/fields-length.config");
const { AdminTypes, FirstNameFieldSetting } = require("@configs/enums.config");
const { firstNameRegex, adminIdRegex } = require("@configs/regex.config");
const { FIRST_NAME_SETTING } = require("@configs/security.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

/* Admin Schema */
const adminSchema = new mongoose.Schema({

    adminId: {
        type: String,
        unique: true,
        immutable: true,
        required: true,
        match: adminIdRegex,
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

    adminType: {
        type: String,
        enum: Object.values(AdminTypes),
        default: AdminTypes.INTERNAL_ADMIN
    }

}, { timestamps: true, versionKey: false });

/* 🔐 Centralized Validation Hook */

adminSchema.pre("validate", function (next) {

    /* ---------- FirstName Validation ---------- */

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

    next();
});

module.exports = {
    AdminModel: mongoose.model(DB_COLLECTIONS.ADMINS, adminSchema)
};