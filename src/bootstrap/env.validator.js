/**

* ENV VALIDATOR
*
* Hard validation before Software Management Service boot.
*
* Flow:
* dotenv
* ↓
* env.defaults
* ↓
* env.validator
* ↓
* bootstrap
  */

const { logWithTime } = require("@utils/time-stamps.util");
const {
    AuditModeHelper,
    FirstNameFieldSettingHelper,
    DeviceTypeHelper
} = require("@utils/enum-validators.util");

/**

* Require environment variables.
* System exits if any are missing.
  */
function requireEnv(
    keys = [],
    context = "Application Boot"
) {
    const missing = keys.filter(envKey => {
        const value = process.env[envKey];

        return (
            value == null ||
            value.trim() === ""
        );
    });

    if (missing.length > 0) {
        logWithTime(`❌ ${context} FAILED`);
        logWithTime("❌ Missing Environment Variables:");


        missing.forEach(envKey => {
            logWithTime(`   - ${envKey}`);
        });

        process.exit(1);


    }
}

/**

* Main environment validation.
  */
function validateEnvironment() {

    logWithTime("🔍 Validating Environment Variables...");

    // ==========================
    // Core Infrastructure
    // ==========================

    requireEnv([
        "DB_URL",
        "ACCESS_TOKEN_SECRET_CODE",
        "REFRESH_TOKEN_SECRET_CODE"
    ], "Core System");

    // ==========================
    // Service Identity
    // ==========================

    requireEnv([
        "SOFTWARE_MANAGEMENT_SERVICE_NAME"
    ], "Service Configuration");

    // ==========================
    // Configuration Enums
    // ==========================

    requireEnv([
        "AUDIT_MODE",
        "FIRST_NAME_SETTING",
        "DEVICE_TYPE"
    ], "Configuration");

    // Audit Mode

    if (!AuditModeHelper.validate(process.env.AUDIT_MODE)) {
        process.exit(1);
    }

    // First Name Setting

    if (
        !FirstNameFieldSettingHelper.validate(
            process.env.FIRST_NAME_SETTING
        )
    ) {
        process.exit(1);
    }

    // Device Type

    if (
        !DeviceTypeHelper.validate(
            process.env.DEVICE_TYPE
        )
    ) {
        process.exit(1);
    }

    // ==========================
    // Microservice Mode
    // ==========================

    if (
        process.env.MAKE_IT_MICROSERVICE?.toLowerCase() === "true"
    ) {
        requireEnv([
            "CUSTOM_AUTH_SERVICE_TOKEN_SECRET",
            "SERVICE_INSTANCE_NAME",
            "REDIS_KEY_SALT",
            "CUSTOM_AUTH_SERVICE_URI",
            "ADMIN_PANEL_SERVICE_URI",
            "CUSTOM_AUTH_SERVICE_NAME",
            "ADMIN_PANEL_SERVICE_NAME"
        ], "Microservice Mode");
    }

    // ==========================
    // Optional Business Policies
    // ==========================
    //
    // DO NOT REQUIRE:
    //
    // DEFAULT_ALLOW_STABILIZING_ROLLBACK
    //
    // env.defaults.js provides fallback.
    //

    logWithTime("✅ Environment Validation Completed");
}

module.exports = {
    validateEnvironment,
    requireEnv
};
