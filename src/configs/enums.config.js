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
    ORGANIZATION: "organization",
    MULTI_ORGANIZATION: "multi_organization"
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

const ProjectCreationReason = Object.freeze({
  NEW_FEATURE: "new_feature",
  CLIENT_REQUEST: "client_request",
  INTERNAL_INITIATIVE: "internal_initiative",
  RESEARCH: "research",
  MAINTENANCE: "maintenance",
  OTHER: "other"
});

const ProjectUpdationReason = Object.freeze({
  SCOPE_CHANGE: "scope_change",
  REQUIREMENT_UPDATE: "requirement_update",
  ERROR_CORRECTION: "error_correction",
  PERFORMANCE_IMPROVEMENT: "performance_improvement",
  CLIENT_FEEDBACK: "client_feedback",
  INTERNAL_REVIEW: "internal_review",
  OTHER: "other"
});

const ProjectAbortReason = Object.freeze({
  RESOURCE_CONSTRAINTS: "resource_constraints",
  PRIORITY_CHANGE: "priority_change",
  TECHNICAL_CHALLENGES: "technical_challenges",
  BUDGET_ISSUES: "budget_issues",
  CLIENT_REQUEST: "client_request",
  OTHER: "other"
});

const ProjectOnHoldReason = Object.freeze({
  RESOURCE_CONSTRAINTS: "resource_constraints",
  AWAITING_CLIENT_FEEDBACK: "awaiting_client_feedback",
  BUDGET_ISSUES: "budget_issues",
  PRIORITY_CHANGE: "priority_change",
  TECHNICAL_CHALLENGES: "technical_challenges",
  OTHER: "other",
});

const ProjectResumeReason = Object.freeze({
  RESOURCE_AVAILABILITY: "resource_availability",
  PRIORITY_REASSESSMENT: "priority_reassessment",
  TECHNICAL_BREAKTHROUGH: "technical_breakthrough",
  BUDGET_APPROVAL: "budget_approval",
  CLIENT_REQUEST: "client_request",
  OTHER: "other"
});

const ProjectStatus = Object.freeze({
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  ABORTED: "ABORTED"
});

const ProjectDeletionReason = Object.freeze({
  COMPLETED: "completed_project_archived",
  ABORTED: "aborted_project_removed",
  DUPLICATE: "duplicate_project_created",
  TEST_PROJECT: "test_or_demo_project_cleanup",
  ADMIN_ERROR: "created_by_admin_mistake",
  OTHER: "other",
});

const Phases = Object.freeze({
  INCEPTION: "INCEPTION",
  ELICITATION: "ELICITATION",
  ELABORATION: "ELABORATION",
  NEGOTIATION: "NEGOTIATION",
  SPECIFICATION: "SPECIFICATION",
  VALIDATION: "VALIDATION",
  MANAGEMENT: "MANAGEMENT"
});

const StakeholderDeletionReason = Object.freeze({
  DUPLICATE: "duplicate_stakeholder",
  TEST_STAKEHOLDER: "test_or_demo_stakeholder_cleanup",
  ADMIN_ERROR: "created_by_admin_mistake",
  ORGANIZATION_REMOVED_FROM_CLIENT: "organization_removed_from_client",
  OTHER: "other",
});

const PhaseDeletionReason = Object.freeze({
  DUPLICATE: "duplicate_phase",
  TEST_PHASE: "test_or_demo_phase_cleanup",
  ADMIN_ERROR: "created_by_admin_mistake",
  OTHER: "other",
});

const ValidationPhaseStatus = Object.freeze({
  DRAFT: "DRAFT",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED"
});

const ProjectRoleTypes = Object.freeze({
  MANAGER: "manager",
  DEVELOPER: "developer",
  TESTER: "tester",
  ANALYST: "analyst",
  OTHER: "other"
});

const ProjectCategoryTypes = Object.freeze({
  INDIVIDUAL: "individual",
  ORGANIZATION: "organization",
  MULTI_ORGANIZATION: "multi_organization"
});

const ProjectTypes = Object.freeze({
  DEVELOPMENT: "development",
  ENHANCEMENT: "enhancement",
  MAINTENANCE: "maintenance",
  OTHER: "other"
});

const TotalTypes = Object.freeze({
  ADMIN: "ADMIN",
  USER: "USER",
  CLIENT: "CLIENT"
});

const PriorityLevels = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL"
});

const RequestStatus = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
});

const RejectProductRequestReasonType = Object.freeze({
  INSUFFICIENT_INFORMATION: "INSUFFICIENT_INFORMATION",
  NOT_ALIGNED_WITH_STRATEGY: "NOT_ALIGNED_WITH_STRATEGY",
  BUDGET_CONSTRAINTS: "BUDGET_CONSTRAINTS",
  RESOURCE_LIMITATIONS: "RESOURCE_LIMITATIONS",
  DUPLICATE_REQUEST: "DUPLICATE_REQUEST",
  OTHER: "OTHER"
});

const ApproveProductRequestReasonType = Object.freeze({
  ALIGNED_WITH_STRATEGY: "ALIGNED_WITH_STRATEGY",
  HIGH_VALUE: "HIGH_VALUE",
  URGENT_NEEDS: "URGENT_NEEDS",
  RESOURCE_AVAILABILITY: "RESOURCE_AVAILABILITY",
  OTHER: "OTHER"
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
  ClientRoleTypes,
  ProjectCreationReason,
  ProjectUpdationReason,
  ProjectOnHoldReason,
  ProjectStatus,
  ProjectAbortReason,
  ProjectResumeReason,
  ProjectDeletionReason,
  Phases,
  StakeholderDeletionReason,
  PhaseDeletionReason,
  ValidationPhaseStatus,
  ProjectRoleTypes,
  ProjectCategoryTypes,
  ProjectTypes,
  TotalTypes,
  PriorityLevels,
  RequestStatus,
  ApproveProductRequestReasonType,
  RejectProductRequestReasonType
};