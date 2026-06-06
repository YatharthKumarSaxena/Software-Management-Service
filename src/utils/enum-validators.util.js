// Enum Helpers using Factory Design Pattern
const { isValidEnumValue, getEnumKeyByValue } = require("./validators-factory.util.js");
const { logWithTime } = require("./time-stamps.util");

const {
  Phases,
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
  ApproveOrgProjectRequestReasonType,
  RejectOrgProjectRequestReasonType,
  ProjectActivationReason,
  ChangeProjectOwnerReasons,
  WorkflowModes,
  PhaseDeletionReason,
  ScopeTypes,
  CommentEntityTypes,
  MeetingPlatformTypes,
  MeetingGroups,
  MeetingCancellationReasons,
  ParticipantTypes,
  IdeaStatuses,
  RejectedIdeaReasonTypes,
  DeferredIdeaReasonTypes,
  RevokeIdeaReasonTypes,
  RequirementTypes,
  RequirementDeletionReason,
  RelationTypes,
  ContributionTypes,
  RevokeRequirementTypes,
  AllowedPhaseTypes
} = require("@configs/enums.config");

const {
  RejectedReasonTypes,
  DeferredReasonTypes,
  IssuedReasonTypes,
  UnlinkReasonTypes
} = require("@configs/reasons.config.js");
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
const ApproveOrgProjectRequestReasonTypeHelper = createEnumHelper(ApproveOrgProjectRequestReasonType, "ApproveOrgProjectRequestReasonType");
const RejectOrgProjectRequestReasonTypeHelper = createEnumHelper(RejectOrgProjectRequestReasonType, "RejectOrgProjectRequestReasonType");
const ProjectActivationReasonHelper = createEnumHelper(ProjectActivationReason, "ProjectActivationReason");
const ChangeProjectOwnerReasonsHelper = createEnumHelper(ChangeProjectOwnerReasons, "ChangeProjectOwnerReasons");
const WorkflowModesHelper = createEnumHelper(WorkflowModes, "WorkflowModes");
const PhasesHelper = createEnumHelper(Phases, "Phases");
const PhaseDeletionReasonHelper = createEnumHelper(PhaseDeletionReason, "PhaseDeletionReason");
const ScopeTypesHelper = createEnumHelper(ScopeTypes, "ScopeTypes");
const CommentEntityTypesHelper = createEnumHelper(CommentEntityTypes, "CommentEntityTypes");
const MeetingPlatformTypesHelper = createEnumHelper(MeetingPlatformTypes, "MeetingPlatformTypes");
const MeetingGroupsHelper = createEnumHelper(MeetingGroups, "MeetingGroups");
const MeetingCancellationReasonsHelper = createEnumHelper(MeetingCancellationReasons, "MeetingCancellationReasons");
const ParticipantTypesHelper = createEnumHelper(ParticipantTypes, "ParticipantTypes");
const IdeaStatusesHelper = createEnumHelper(IdeaStatuses, "IdeaStatuses");
const RejectedIdeaReasonTypesHelper = createEnumHelper(RejectedIdeaReasonTypes, "RejectedIdeaReasonTypes");
const DeferredIdeaReasonTypesHelper = createEnumHelper(DeferredIdeaReasonTypes, "DeferredIdeaReasonTypes");
const RevokeIdeaReasonTypesHelper = createEnumHelper(RevokeIdeaReasonTypes, "RevokeIdeaReasonTypes");
const RejectedReasonTypesHelper = createEnumHelper(RejectedReasonTypes, "RejectedReasonTypes");
const DeferredReasonTypesHelper = createEnumHelper(DeferredReasonTypes, "DeferredReasonTypes");
const IssuedReasonTypesHelper = createEnumHelper(IssuedReasonTypes, "IssuedReasonTypes");
const RequirementTypesHelper = createEnumHelper(RequirementTypes, "RequirementTypes");
const RequirementDeletionReasonHelper = createEnumHelper(RequirementDeletionReason, "RequirementDeletionReason");
const ContributionTypesHelper = createEnumHelper(ContributionTypes, "ContributionTypes");
const RelationTypesHelper = createEnumHelper(RelationTypes, "RelationTypes");
const RevokeRequirementTypesHelper = createEnumHelper(RevokeRequirementTypes, "RevokeRequirementTypes");
const UnlinkReasonTypesHelper = createEnumHelper(UnlinkReasonTypes, "UnlinkReasonTypes");
const AllowedPhaseTypesHelper = createEnumHelper(AllowedPhaseTypes, "AllowedPhaseTypes");

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
  ApproveOrgProjectRequestReasonTypeHelper,
  RejectOrgProjectRequestReasonTypeHelper,
  ProjectActivationReasonHelper,
  ChangeProjectOwnerReasonsHelper,
  WorkflowModesHelper,
  PhasesHelper,
  PhaseDeletionReasonHelper,
  ScopeTypesHelper,
  CommentEntityTypesHelper,
  MeetingPlatformTypesHelper,
  MeetingGroupsHelper,
  MeetingCancellationReasonsHelper,
  ParticipantTypesHelper,
  IdeaStatusesHelper,
  RejectedIdeaReasonTypesHelper,
  DeferredIdeaReasonTypesHelper,
  RevokeIdeaReasonTypesHelper,
  RequirementTypesHelper,
  RequirementDeletionReasonHelper,
  RejectedReasonTypesHelper,
  DeferredReasonTypesHelper,
  IssuedReasonTypesHelper,
  RelationTypesHelper,
  ContributionTypesHelper,
  RevokeRequirementTypesHelper,
  UnlinkReasonTypesHelper,
  AllowedPhaseTypesHelper
};