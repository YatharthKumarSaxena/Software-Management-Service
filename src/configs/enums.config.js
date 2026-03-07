// configs/enums.config.js

const { service } = require("./security.config");

const AuthModes = Object.freeze({
    EMAIL: "EMAIL",
    PHONE: "PHONE",
    BOTH: "BOTH",
    EITHER: "EITHER"
});

const UserTypes = Object.freeze({
    USER: "USER",
    CLIENT: "CLIENT"
});

const DeviceTypes = Object.freeze({
    MOBILE: "MOBILE",
    TABLET: "TABLET",
    LAPTOP: "LAPTOP"
});

const ContactModes = Object.freeze({
    EMAIL: "EMAIL",
    PHONE: "PHONE",
    BOTH: "BOTH"
});

const AdminTypes = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  OPERATIONS_ADMIN: "operations_admin",
  SUPPORT_ADMIN: "support_admin",
  AUDIT_ADMIN: "audit_admin",
  INTERNAL_ADMIN: "internal_admin"
});

// Role Hierarchy: Higher numeric value = Higher authority
// An admin can ONLY act on roles with STRICTLY LOWER hierarchy values
const RoleHierarchy = Object.freeze({
  [AdminTypes.SUPER_ADMIN]: 5,
  [AdminTypes.ORG_ADMIN]: 4,
  [AdminTypes.OPERATIONS_ADMIN]: 3,
  [AdminTypes.SUPPORT_ADMIN]: 2,
  [AdminTypes.AUDIT_ADMIN]: 2,
  [AdminTypes.INTERNAL_ADMIN]: 1
});

const FirstNameFieldSetting = Object.freeze({
  DISABLED: "disabled",
  OPTIONAL: "optional",
  MANDATORY: "mandatory"
});

const AdminErrorTypes = Object.freeze({
  CONFLICT: "CONFLICT",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_DATA: "INVALID_DATA",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  ALREADY_ACTIVE: "ALREADY_ACTIVE",
  ALREADY_INACTIVE: "ALREADY_INACTIVE",
  ALREADY_BLOCKED: "ALREADY_BLOCKED",
  ALREADY_UNBLOCKED: "ALREADY_UNBLOCKED",
  INVALID_ROLE: "INVALID_ROLE",
  INVALID_SUPERVISOR: "INVALID_SUPERVISOR",
  CANNOT_MODIFY_SELF: "CANNOT_MODIFY_SELF"
});

const Roles = Object.freeze({
  ...AdminTypes,
  ...UserTypes
});

const PerformedBy = Object.freeze({
  ...Roles,
  SYSTEM: "system"
});

// Fix: Export PerformedOnTypes (referenced in activity-tracker.model.js)
const PerformedOnTypes = Object.freeze({
  ...PerformedBy,
  DEVICE: "device",
  REQUEST: "request",
  PERMISSION: "permission"
});

const ServiceNames = Object.freeze({
    AUTH_SERVICE: service.Custom_Auth_Service_Name,
    ADMIN_PANEL_SERVICE: service.Admin_Panel_Service_Name,
    SOFTWARE_MANAGEMENT_SERVICE: service.Software_Management_Service_Name
});

const Status = Object.freeze({
  SUCCESS: "success",
  FAILURE: "failure",
  PENDING: "pending"
});

const AuditMode = Object.freeze({
  FULL: "FULL",
  CHANGED_ONLY: "CHANGED_ONLY"
})

const requestType = Object.freeze({
  DEACTIVATION: "deactivation",
  ACTIVATION: "activation",
  ROLE_CHANGE: "role_change",
  PERMISSION_GRANT: "permission_grant",
  PERMISSION_REVOKE: "permission_revoke",
  CLIENT_ONBOARDING: "client_onboarding_self",
  CLIENT_ONBOARDING_ADMIN: "client_onboarding_admin", // New request type for admin-initiated client onboarding
  CLIENT_REVERT: "client_revert"
});

const requestStatus = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED"
});

const PermissionEffect = Object.freeze({
  ALLOW: "ALLOW",
  DENY: "DENY"
});

const OverrideType = Object.freeze({
  SPECIAL_PERMISSION: "special_permission",
  BLOCKED_PERMISSION: "blocked_permission"
});

const ClientStatus = Object.freeze({
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  REVERTED: "reverted"
});

const viewScope = Object.freeze({
  HIERARCHY: "HIERARCHY",
  SELF_ONLY: "SELF_ONLY",
  GLOBAL: "GLOBAL"
});

const RequestLocation = Object.freeze({
    BODY: "body",
    QUERY: "query",
    PARAMS: "params",
    HEADERS: "headers" // Future safety ke liye
});

const ClientTypes = Object.freeze({
    INDIVIDUAL: "individual",
    ORGANIZATION: "organization"
});


const AdminRoleTypes = Object.freeze({
  BUSINESS_ANALYST: "business_analyst",
  DEVELOPER: "developer",
  MANAGER: "manager",
  ANALYST: "analyst",
  OTHER: "other",
  CEO: "ceo",
});

const ClientRoleTypes = Object.freeze({
  SPONSOR: "sponsor",
  PARTNER: "partner",
  VENDOR: "vendor",
  END_USER: "end_user",
  OTHER: "other"
});

module.exports = {
  AdminTypes,
  RoleHierarchy,
  DeviceTypes,
  PerformedBy,
  PerformedOnTypes,
  AuthModes,
  Roles,
  Status,
  AuditMode,
  requestType,
  requestStatus,
  viewScope,
  FirstNameFieldSetting,
  AdminErrorTypes,
  RequestLocation,
  UserTypes,
  ContactModes,
  ServiceNames,
  PermissionEffect,
  OverrideType,
  ClientStatus,
  ClientTypes,
  AdminRoleTypes,
  ClientRoleTypes
};