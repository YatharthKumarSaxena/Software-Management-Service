// Enum Helpers using Factory Design Pattern
const { isValidEnumValue, getEnumKeyByValue } = require("./validators-factory.util.js");
const { logWithTime } = require("./time-stamps.util");

const {
  UserTypes,
  AuthModes,
  DeviceTypes,
  AuditMode,
  FirstNameFieldSetting,
  ContactModes,
  ProjectCreationReason,
  ProjectUpdationReason,
  ProjectOnHoldReason,
  ProjectAbortReason,
  ProjectResumeReason,
  ProjectStatus,
  ProjectDeletionReason,
  InceptionDeletionReason,
  AdminRoleTypes,
  ClientRoleTypes,
  StakeholderDeletionReason,
  ProjectRoleTypes,
  ProjectCategoryTypes,
  ProjectTypes,
  PriorityLevels,
  ApproveProductRequestReasonType,
  RejectProductRequestReasonType,
  ProjectActivationReason,
  ChangeProjectOwnerReasons,
  ElicitationModes,
  PhaseDeletionReason,
  ScopeTypes,
  CommentEntityTypes
} = require("@configs/enums.config");

/**
 * Factory to create enum helper with boolean returns
 * Returns true/false only - caller decides response handling
 * This allows collecting multiple validation errors
 * 
 * @param {Object} enumObj - The frozen enum object
 * @param {String} name - Enum name for logging context
 */

const createEnumHelper = (enumObj, name) => ({
  validate: (value) => {
    const result = isValidEnumValue(enumObj, value);
    logWithTime(`[${name}] validate("${value}") →`, result);
    return result;
  },
  reverseLookup: (value) => {
    const result = getEnumKeyByValue(enumObj, value);
    logWithTime(`[${name}] reverseLookup("${value}") →`, result);
    return result;
  },
  getValidValues: () => {
    return Object.values(enumObj);
  },
  getName: () => name
});

// Enum-specific helpers
const DeviceTypeHelper = createEnumHelper(DeviceTypes, "DeviceType");
const UserTypeHelper = createEnumHelper(UserTypes, "UserType");
const AuthModesHelper = createEnumHelper(AuthModes, "AuthModes");
const AuditModeHelper = createEnumHelper(AuditMode, "AuditMode");
const FirstNameFieldSettingHelper = createEnumHelper(FirstNameFieldSetting, "FirstNameFieldSetting");
const ContactModesHelper = createEnumHelper(ContactModes, "ContactModes");
const ProjectCreationReasonHelper = createEnumHelper(ProjectCreationReason, "ProjectCreationReason");
const ProjectUpdationReasonHelper = createEnumHelper(ProjectUpdationReason, "ProjectUpdationReason");
const ProjectOnHoldReasonHelper  = createEnumHelper(ProjectOnHoldReason,  "ProjectOnHoldReason");
const ProjectAbortReasonHelper   = createEnumHelper(ProjectAbortReason,   "ProjectAbortReason");
const ProjectResumeReasonHelper  = createEnumHelper(ProjectResumeReason,  "ProjectResumeReason");
const ProjectStatusHelper        = createEnumHelper(ProjectStatus,        "ProjectStatus");
const ProjectDeletionReasonHelper = createEnumHelper(ProjectDeletionReason, "ProjectDeletionReason");
const InceptionDeletionReasonHelper = createEnumHelper(InceptionDeletionReason, "InceptionDeletionReason");

const AdminRoleTypesHelper = createEnumHelper(AdminRoleTypes, "AdminRoleTypes");
const ClientRoleTypesHelper = createEnumHelper(ClientRoleTypes, "ClientRoleTypes");
const StakeholderDeletionReasonHelper = createEnumHelper(StakeholderDeletionReason, "StakeholderDeletionReason");
const ProjectRoleTypesHelper = createEnumHelper(ProjectRoleTypes, "ProjectRoleTypes");
const ProjectCategoryTypesHelper = createEnumHelper(ProjectCategoryTypes, "ProjectCategoryTypes");
const ProjectTypesHelper = createEnumHelper(ProjectTypes, "ProjectTypes");
const PriorityLevelsHelper = createEnumHelper(PriorityLevels, "PriorityLevels");
const ApproveProductRequestReasonTypeHelper = createEnumHelper(ApproveProductRequestReasonType, "ApproveProductRequestReasonType");
const RejectProductRequestReasonTypeHelper = createEnumHelper(RejectProductRequestReasonType, "RejectProductRequestReasonType");
const ProjectActivationReasonHelper = createEnumHelper(ProjectActivationReason, "ProjectActivationReason");
const ChangeProjectOwnerReasonsHelper = createEnumHelper(ChangeProjectOwnerReasons, "ChangeProjectOwnerReasons");
const ElicitationModesHelper = createEnumHelper(ElicitationModes, "ElicitationModes");
const PhaseDeletionReasonHelper = createEnumHelper(PhaseDeletionReason, "PhaseDeletionReason");
const ScopeTypesHelper = createEnumHelper(ScopeTypes, "ScopeTypes");
const CommentEntityTypesHelper = createEnumHelper(CommentEntityTypes, "CommentEntityTypes");

module.exports = {
  DeviceTypeHelper,
  UserTypeHelper,
  AuthModesHelper,
  AuditModeHelper,
  FirstNameFieldSettingHelper,
  ContactModesHelper,
  ProjectCreationReasonHelper,
  ProjectUpdationReasonHelper,
  ProjectOnHoldReasonHelper,
  ProjectAbortReasonHelper,
  ProjectResumeReasonHelper,
  ProjectStatusHelper,
  ProjectDeletionReasonHelper,
  InceptionDeletionReasonHelper,
  AdminRoleTypesHelper,
  ClientRoleTypesHelper,
  StakeholderDeletionReasonHelper,
  ProjectRoleTypesHelper,
  ProjectCategoryTypesHelper,
  ProjectTypesHelper,
  PriorityLevelsHelper,
  ApproveProductRequestReasonTypeHelper,
  RejectProductRequestReasonTypeHelper,
  ProjectActivationReasonHelper,
  ChangeProjectOwnerReasonsHelper,
  ElicitationModesHelper,
  PhaseDeletionReasonHelper,
  ScopeTypesHelper,
  CommentEntityTypesHelper
};