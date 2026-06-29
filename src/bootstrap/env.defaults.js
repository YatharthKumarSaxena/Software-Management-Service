/**

* ENV DEFAULTS
*
* Safe default values for non-critical configuration.
*
* Rules:
* * No secrets.
* * No JWT keys.
* * No SMTP credentials.
* * No DB URLs.
* * No service tokens.
* * No authentication modes.
* * No verification modes.
    */

function applyEnvDefaults() {

// Environment
process.env.NODE_ENV ||= "development";
process.env.PORT_NUMBER ||= "8080";

// Microservice
process.env.MAKE_IT_MICROSERVICE ||= "false";

// Device Defaults
process.env.DEVICE_TYPE ||= "LAPTOP";
process.env.DEVICE_UUID ||= "00000000-0000-4000-8000-000000000000";
process.env.SERVICE_INSTANCE_NAME ||= "software-management-service";

// Logging
process.env.ADVANCED_LOGGING_ENABLED ||= "true";
process.env.ACTIVITY_TRACKING_ENABLED ||= "true";

// UI / Behaviour Defaults
process.env.FIRST_NAME_SETTING ||= "optional";

// Audit
process.env.AUDIT_MODE ||= "CHANGED_ONLY";

// RE Tool Defaults

// Allows:
// OPEN <-> STABILIZING (subject to project policy)
// STABILIZING -> FROZEN
process.env.DEFAULT_ALLOW_STABILIZING_ROLLBACK ||= "true";

// Redis Defaults
process.env.REDIS_HOST ||= "127.0.0.1";
process.env.REDIS_PORT ||= "6379";
process.env.REDIS_DB ||= "0";
process.env.REDIS_MAX_RETRY_ATTEMPTS ||= "10";
process.env.REDIS_RETRY_INITIAL_DELAY ||= "100";
process.env.REDIS_RETRY_MAX_DELAY ||= "2000";

// Global Rate Limiter Defaults
process.env.RATE_LIMIT_WINDOW ||= "10";
process.env.RATE_LIMIT_MAX ||= "100";

// Service Token
process.env.SERVICE_TOKEN_EXPIRY ||= "3600";

// Auth & Access
process.env.AUTH_MODE ||= "EMAIL";
process.env.FRONTEND_URL ||= "http://localhost:5500";
process.env.ACCESS_TOKEN_EXPIRY ||= "6000";
process.env.REFRESH_TOKEN_EXPIRY ||= "604800";

// Bulk Import Defaults
process.env.REQUIREMENT_BULK_IMPORT_MAX_FILES ||= "10";
process.env.REQUIREMENT_BULK_IMPORT_MAX_FILE_SIZE_MB ||= "20";
process.env.BULK_IMPORT_UPLOAD_ORIGINAL ||= "false";
process.env.BULK_IMPORT_UPLOAD_PROCESSED ||= "true";
process.env.BULK_IMPORT_MAX_CONCURRENT_UPLOADS ||= "5";

// Supabase Defaults
process.env.SUPABASE_SIGNED_URL_EXPIRY ||= "604800";

}

module.exports = {
applyEnvDefaults
};
