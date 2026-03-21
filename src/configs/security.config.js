const { getMyEnv, getMyEnvAsBool, getMyEnvAsNumber, getMyEnvAsArray } = require("@/utils/env.util");

module.exports = {
  authMode: getMyEnv('AUTH_MODE', 'EMAIL'),
  auditMode: getMyEnv('AUDIT_MODE', 'CHANGED_ONLY'),
  ACTIVITY_TRACKING_ENABLED: getMyEnvAsBool('ACTIVITY_TRACKING_ENABLED', true),
  otp: {
    length: 6,                // digits in OTP
    maxAttempts: 5,
    digits: "0123456789"      // OTP characters allowed
  },
  hashing: {
    algorithm: "sha256",
    encoding: "hex",
    saltLength: 16
  },
  WHITELISTED_DEVICE_UUIDS: getMyEnvAsArray('WHITELISTED_DEVICE_UUIDS'),
  FIRST_NAME_SETTING: getMyEnv('FIRST_NAME_SETTING', 'mandatory'),
  ADVANCED_LOGGING_ENABLED: getMyEnvAsBool('ADVANCED_LOGGING_ENABLED', false),
  link: {
    length: 32,
    algorithm: "sha256",
    encoding: "hex",
    secret: getMyEnv('VERIFICATION_LINK_SECRET', 'default-secret-change-in-production')
  },
  service: {
    Custom_Auth_Service_Name: getMyEnv('CUSTOM_AUTH_SERVICE_NAME', 'Custom_Auth_Service'),
    Software_Management_Service_Name: getMyEnv('SOFTWARE_MANAGEMENT_SERVICE_NAME', 'Software_Management_Service'),
    Admin_Panel_Service_Name: getMyEnv('ADMIN_PANEL_SERVICE_NAME', 'Admin_Panel_Service'),
    // Service-to-Service Authentication
    CUSTOM_AUTH_SERVICE_TOKEN_SECRET: getMyEnv('CUSTOM_AUTH_SERVICE_TOKEN_SECRET', 'change-this-secret-in-production-and-keep-same-across-services'),
    SOFTWARE_MANAGEMENT_SERVICE_TOKEN_SECRET: getMyEnv('SOFTWARE_MANAGEMENT_SERVICE_TOKEN_SECRET', 'change-this-secret-in-production-and-keep-same-across-services'),
    ADMIN_PANEL_SERVICE_TOKEN_SECRET: getMyEnv('ADMIN_PANEL_SERVICE_TOKEN_SECRET', 'change-this-secret-in-production-and-keep-same-across-services'),
    SERVICE_TOKEN_EXPIRY: getMyEnv('SERVICE_TOKEN_EXPIRY', '1h'),

    ALLOWED_SERVICE_NAMES: getMyEnvAsArray('ALLOWED_SERVICE_NAMES', []),
    algorithms: ["HS256"]
  },

  device: {
    DEVICE_UUID: getMyEnv('DEVICE_UUID', "00000000-0000-4000-8000-000000000000"),
    DEVICE_TYPE: getMyEnv('DEVICE_TYPE', "LAPTOP"),
    DEVICE_NAME: getMyEnv('DEVICE_NAME', "System Device")
  }
};