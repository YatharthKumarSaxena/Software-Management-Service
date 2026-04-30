const FetchAdminDetailsReasons = Object.freeze({
  SUPPORT_REQUEST: "SupportRequest",                     // Audit-safe
  SECURITY_INVESTIGATION: "SecurityInvestigation",
  COMPLIANCE_AUDIT: "ComplianceAudit",
  USER_COMPLAINT: "UserComplaint",
  PAYMENT_ISSUE: "PaymentIssue",
  ADMIN_OVERSIGHT: "AdminOversight",
  OTHER: "Other"
});

const FetchUserDetailsReasons = Object.values({
  SUPPORT_REQUEST: "support_request",
  SECURITY_INVESTIGATION: "security_investigation",
  COMPLIANCE_AUDIT: "compliance_audit",
  USER_COMPLAINT: "user_complaint",
  PAYMENT_ISSUE: "payment_issue",
  ADMIN_OVERSIGHT: "admin_oversight",
  OTHER: "other"
});

const BlockUserReasons = Object.freeze({
  POLICY_VIOLATION: "policy_violation",                 // DB-safe
  SPAM_ACTIVITY: "spam_activity",
  HARASSMENT: "harassment",
  FRAUDULENT_BEHAVIOR: "fraudulent_behavior",
  SUSPICIOUS_LOGIN: "suspicious_login",
  OTHER: "other"
});

const UnblockUserReasons = Object.freeze({
  MANUAL_REVIEW_PASSED: "manual_review_passed",         // DB-safe
  USER_APPEAL_GRANTED: "user_appeal_granted",
  SYSTEM_ERROR: "system_error",
  MISTAKE: "mistake",
  OTHER: "other"
});

const ActivationReasons = Object.freeze({
  REINSTATEMENT_AFTER_REVIEW: "reinstatement_after_review",
  TEMPORARY_SUSPENSION_ENDED: "temporary_suspension_ended",
  APPEAL_APPROVED: "appeal_approved",
  ADMINISTRATIVE_DECISION: "administrative_decision",
  SYSTEM_ERROR_CORRECTION: "system_error_correction",
  OTHER: "other"
});

const DeactivationReasons = Object.freeze({
  POLICY_VIOLATION: "policy_violation",
  MISCONDUCT: "misconduct",
  SECURITY_CONCERN: "security_concern",
  RESIGNED: "resigned",
  TERMINATED: "terminated",
  TEMPORARY_SUSPENSION: "temporary_suspension",
  INACTIVITY: "inactivity",
  OTHER: "other"
});

const AuthLogCheckReasons = Object.freeze({
  SECURITY_INVESTIGATION: "security_investigation",
  SUSPICIOUS_ACTIVITY_REPORTED: "suspicious_activity_reported",
  ACCOUNT_COMPROMISE_SUSPECTED: "account_compromise_suspected",
  USER_SUPPORT_REQUEST: "user_support_request",
  AUDIT_COMPLIANCE: "audit_compliance",
  FAILED_LOGIN_INVESTIGATION: "failed_login_investigation",
  OTHER: "other"
});

const RequestReviewReasons = Object.freeze({
  APPROVED_AS_VALID: "approved_as_valid",
  REJECTED_INSUFFICIENT_JUSTIFICATION: "rejected_insufficient_justification",
  REJECTED_POLICY_VIOLATION: "rejected_policy_violation",
  APPROVED_WITH_CONDITIONS: "approved_with_conditions",
  REJECTED_DUPLICATE_REQUEST: "rejected_duplicate_request",
  APPROVED_EMERGENCY: "approved_emergency",
  OTHER: "other"
});

const UserAccountDetailsReasons = Object.freeze({
  SUPPORT_REQUEST: "support_request",
  ACCOUNT_VERIFICATION: "account_verification",
  SECURITY_INVESTIGATION: "security_investigation",
  COMPLIANCE_AUDIT: "compliance_audit",
  USER_COMPLAINT: "user_complaint",
  PAYMENT_ISSUE: "payment_issue",
  OTHER: "other"
});

const UserActiveDevicesReasons = Object.freeze({
  SECURITY_CHECK: "security_check",
  SUSPICIOUS_ACTIVITY: "suspicious_activity",
  USER_REPORTED_UNAUTHORIZED: "user_reported_unauthorized",
  SUPPORT_REQUEST: "support_request",
  COMPLIANCE_AUDIT: "compliance_audit",
  DEVICE_LIMIT_EXCEEDED: "device_limit_exceeded",
  OTHER: "other"
});

const UpdateAdminDetailsReasons = Object.freeze({
  CONTACT_INFO_UPDATE: "contact_info_update",
  ROLE_CHANGE: "role_change",
  ERROR_CORRECTION: "error_correction",
  ADMIN_REQUEST: "admin_request",
  COMPLIANCE_UPDATE: "compliance_update",
  REORGANIZATION: "reorganization",
  OTHER: "other"
});

const AdminUpdateRoleReasons = Object.freeze({
  PROMOTION: "Promotion",                               // Audit-safe
  DEMOTION: "Demotion",
  REORGANIZATION: "Reorganization",
  PERFORMANCE_BASED: "PerformanceBased",
  ADMIN_REQUEST: "AdminRequest",
  OTHER: "Other"
});

const AdminCreationReasons = Object.freeze({
  NEW_HIRE: "NewHire",                                   // Audit-safe
  REPLACEMENT: "Replacement",
  ROLE_EXPANSION: "RoleExpansion",
  TEMPORARY_ASSIGNMENT: "TemporaryAssignment",
  PROJECT_REQUIREMENT: "ProjectRequirement",
  OTHER: "Other"
});

const FetchDeviceDetailsReasons = Object.freeze({
  SECURITY_AUDIT: "SecurityAudit",                     // Audit-safe
  COMPLIANCE_CHECK: "ComplianceCheck",
  SUSPICIOUS_ACTIVITY_INVESTIGATION: "SuspiciousActivityInvestigation",
  USER_SUPPORT_REQUEST: "UserSupportRequest",
  INCIDENT_INVESTIGATION: "IncidentInvestigation",
  ADMIN_OVERSIGHT: "AdminOversight",
  OTHER: "Other"
});

const ChangeSupervisorReasons = Object.freeze({
  REORGANIZATION: "reorganization",
  PERFORMANCE_ISSUES: "performance_issues",
  PERSONAL_REQUEST: "personal_request",
  ADMIN_REQUEST: "admin_request",
  OTHER: "other"
});

const ViewActivityTrackerReasons = Object.freeze({
  SECURITY_AUDIT: "security_audit",
  COMPLIANCE_CHECK: "compliance_check",
  SUSPICIOUS_ACTIVITY_INVESTIGATION: "suspicious_activity_investigation",
  PERIODIC_REVIEW: "periodic_review",
  INCIDENT_INVESTIGATION: "incident_investigation",
  PERFORMANCE_MONITORING: "performance_monitoring",
  ADMIN_OVERSIGHT: "admin_oversight",
  SUPPORT_REQUEST: "support_request",
  OTHER: "other"
});

const BlockDeviceReasons = Object.freeze({
  SUSPICIOUS_ACTIVITY: "suspicious_activity",
  COMPROMISED_DEVICE: "compromised_device",
  UNAUTHORIZED_ACCESS: "unauthorized_access",
  SECURITY_THREAT: "security_threat",
  USER_REQUESTED: "user_requested",
  MALWARE_DETECTED: "malware_detected",
  OTHER: "other"
});

const UnblockDeviceReasons = Object.freeze({
  VERIFIED_SAFE: "verified_safe",
  USER_VERIFIED: "user_verified",
  FALSE_POSITIVE: "false_positive",
  DEVICE_SECURED: "device_secured",
  USER_REQUESTED: "user_requested",
  SECURITY_CHECK_PASSED: "security_check_passed",
  OTHER: "other"
});

const SpecialPermissionReasons = Object.freeze({
  TEMPORARY_ACCESS: "temporary_access",
  EMERGENCY_GRANT: "emergency_grant",
  PROJECT_REQUIREMENT: "project_requirement",
  SUPERVISOR_APPROVAL: "supervisor_approval",
  ROLE_EXPANSION: "role_expansion",
  COMPLIANCE_REQUIREMENT: "compliance_requirement",
  OTHER: "other"
});

const BlockPermissionReasons = Object.freeze({
  SECURITY_CONCERN: "security_concern",
  POLICY_VIOLATION: "policy_violation",
  TEMPORARY_RESTRICTION: "temporary_restriction",
  UNDER_INVESTIGATION: "under_investigation",
  COMPLIANCE_RESTRICTION: "compliance_restriction",
  ADMINISTRATIVE_DECISION: "administrative_decision",
  OTHER: "other"
});

const ClientCreationReasons = Object.freeze({
  NEW_CLIENT_ONBOARDING: "new_client_onboarding",
  USER_UPGRADE: "user_upgrade",
  BUSINESS_EXPANSION: "business_expansion",
  SPECIAL_ARRANGEMENT: "special_arrangement",
  MIGRATION: "migration",
  OTHER: "other"
});

const ClientRevertReasons = Object.freeze({
  CLIENT_REQUEST: "client_request",
  POLICY_VIOLATION: "policy_violation",
  DOWNGRADE: "downgrade",
  ACCOUNT_CLEANUP: "account_cleanup",
  MISTAKE_CORRECTION: "mistake_correction",
  OTHER: "other"
});

const RoleChangeReasons = Object.freeze({
  PROMOTION: "promotion",
  DEMOTION: "demotion",
  REORGANIZATION: "reorganization",
  PERFORMANCE_BASED: "performance_based",
  SKILL_DEVELOPMENT: "skill_development",
  ADMIN_REQUEST: "admin_request",
  DEPARTMENT_TRANSFER: "department_transfer",
  OTHER: "other"
});

const ClientOnboardingRejectionReasons = Object.freeze({
  INSUFFICIENT_RESOURCES: "insufficient_resources",
  SCOPE_CREEP: "scope_creep",
  BUDGET_OVERRUN: "budget_overrun",
  MISALIGNMENT_WITH_GOALS: "misalignment_with_goals",
  TECHNICAL_FEASIBILITY: "technical_feasibility",
  SECURITY_CONCERNS: "security_concerns",
  OTHER: "other"
});

const BlockAdminReasons = Object.freeze({
  POLICY_VIOLATION: "policy_violation",
  MISCONDUCT: "misconduct",
  SECURITY_CONCERN: "security_concern",
  RESIGNED: "resigned",
  TERMINATED: "terminated",
  TEMPORARY_SUSPENSION: "temporary_suspension",
  INACTIVITY: "inactivity",
  OTHER: "other"
});

const UnblockAdminReasons = Object.freeze({
  REINSTATEMENT_AFTER_REVIEW: "reinstatement_after_review",
  TEMPORARY_SUSPENSION_ENDED: "temporary_suspension_ended",
  APPEAL_APPROVED: "appeal_approved",
  ADMINISTRATIVE_DECISION: "administrative_decision",
  SYSTEM_ERROR_CORRECTION: "system_error_correction",
  OTHER: "other"
});

const SuspensionReasons = Object.freeze({
  POLICY_VIOLATION: "policy_violation",
  MISCONDUCT: "misconduct",
  SECURITY_CONCERN: "security_concern",
  RESIGNED: "resigned",
  TERMINATED: "terminated",
  TEMPORARY_SUSPENSION: "temporary_suspension",
  INACTIVITY: "inactivity",
  OTHER: "other"
});

const UnsuspensionReasons = Object.freeze({
  REINSTATEMENT_AFTER_REVIEW: "reinstatement_after_review",
  TEMPORARY_SUSPENSION_ENDED: "temporary_suspension_ended",
  APPEAL_APPROVED: "appeal_approved",
  ADMINISTRATIVE_DECISION: "administrative_decision",
  SYSTEM_ERROR_CORRECTION: "system_error_correction",
  OTHER: "other"
});

const RejectedReasonTypes = Object.freeze({
  OUT_OF_SCOPE: "OUT_OF_SCOPE",
  DUPLICATE: "DUPLICATE",
  BUSINESS_DECISION: "BUSINESS_DECISION",
  TECHNICAL_LIMITATION: "TECHNICAL_LIMITATION",
  OTHER: "OTHER"
});

const DeferredReasonTypes = Object.freeze({
  LOW_PRIORITY: "LOW_PRIORITY",
  DEPENDENCY_ISSUE: "DEPENDENCY_ISSUE",
  CLARIFICATION_NEEDED: "CLARIFICATION_NEEDED",
  RESOURCE_CONSTRAINT: "RESOURCE_CONSTRAINT",
  OTHER: "OTHER"
});

const IssuedReasonTypes = Object.freeze({
  INCOMPLETE_INFORMATION: "INCOMPLETE_INFORMATION", // Acceptance criteria ya detail missing hai
  AMBIGUOUS_WORDING: "AMBIGUOUS_WORDING",           // Samajh nahi aa raha, double meaning hai
  LOGICAL_CONFLICT: "LOGICAL_CONFLICT",             // Kisi aur requirement se clash kar raha hai
  TECHNICAL_FEASIBILITY: "TECHNICAL_FEASIBILITY",   // Dev team ko doubt hai ki yeh ban payega ya nahi
  COMPLIANCE_VIOLATION: "COMPLIANCE_VIOLATION",     // Security ya business rules tod raha hai
  OTHER: "OTHER"
});

const UnlinkReasonTypes = Object.freeze({
  REQUIREMENT_REMOVED: "REQUIREMENT_REMOVED",
  FEATURE_REMOVED: "FEATURE_REMOVED",
  MAPPING_ERROR: "MAPPING_ERROR",
  SCOPE_CHANGE: "SCOPE_CHANGE",
  RESTRUCTURING: "RESTRUCTURING",
  OTHER: "OTHER"
});

const RevokeReasonTypes = Object.freeze({
  MARKED_ACCEPTED_BY_MISTAKE: "MARKED_ACCEPTED_BY_MISTAKE",
  OUT_OF_SCOPE: "OUT_OF_SCOPE",
  DUPLICATE: "DUPLICATE",
  BUSINESS_DECISION: "BUSINESS_DECISION",
  TECHNICAL_LIMITATION: "TECHNICAL_LIMITATION",
  OTHER: "OTHER"
});

const ReviewNoteDeletionReasons = Object.freeze({
  INCORRECT_FEEDBACK: "INCORRECT_FEEDBACK",
  DUPLICATE_REVIEW: "DUPLICATE_REVIEW",
  IRRELEVANT_COMMENT: "IRRELEVANT_COMMENT",
  PERSONAL_REQUEST: "PERSONAL_REQUEST",
  NO_LONGER_APPLICABLE: "NO_LONGER_APPLICABLE",
  CONFIDENTIAL_INFORMATION: "CONFIDENTIAL_INFORMATION",
  ADMINISTRATIVE_CLEANUP: "ADMINISTRATIVE_CLEANUP",
  OTHER: "OTHER"
});

module.exports = {
  BlockUserReasons,
  UnblockUserReasons,
  ActivationReasons,
  DeactivationReasons,
  AuthLogCheckReasons,
  RequestReviewReasons,
  UserAccountDetailsReasons,
  UserActiveDevicesReasons,
  UpdateAdminDetailsReasons,
  ViewActivityTrackerReasons,
  ChangeSupervisorReasons,
  BlockDeviceReasons,
  UnblockDeviceReasons,
  AdminCreationReasons,
  AdminUpdateRoleReasons,
  FetchAdminDetailsReasons,
  FetchUserDetailsReasons,
  FetchDeviceDetailsReasons,
  SpecialPermissionReasons,
  BlockPermissionReasons,
  ClientCreationReasons,
  ClientRevertReasons,
  RoleChangeReasons,
  ClientOnboardingRejectionReasons,
  SuspensionReasons,
  UnsuspensionReasons,
  BlockAdminReasons,
  UnblockAdminReasons,
  RejectedReasonTypes,
  DeferredReasonTypes,
  IssuedReasonTypes,
  UnlinkReasonTypes,
  RevokeReasonTypes,
  ReviewNoteDeletionReasons
};