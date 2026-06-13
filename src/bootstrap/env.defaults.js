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

}

module.exports = {
applyEnvDefaults
};
