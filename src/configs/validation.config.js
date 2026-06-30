const {
  projectNameLength,
  descriptionLength,
  problemStatementLength,
  projectGoalLength,
  titleLength,
  productVisionLength
} = require("./fields-length.config");

const {
  ProjectCreationReasonHelper,
  ProjectUpdationReasonHelper,
  ProjectOnHoldReasonHelper,
  ProjectAbortReasonHelper,
  ProjectResumeReasonHelper,
  ProjectDeletionReasonHelper,
  PhaseStatusHelper,
  InceptionDeletionReasonHelper,
  AdminRoleTypesHelper,
  ClientRoleTypesHelper,
  StakeholderDeletionReasonHelper,
  ProjectRoleTypesHelper,
  ProjectCategoryTypesHelper,
  ProjectTypesHelper,
  PriorityLevelsHelper,
  ProjectActivationReasonHelper,
  ChangeProjectOwnerReasonsHelper,
  WorkflowModesHelper,
  PhasesHelper,
  PhaseDeletionReasonHelper,
  ApproveProductRequestReasonTypeHelper,
  RejectProductRequestReasonTypeHelper,
  ApproveOrgProjectRequestReasonTypeHelper,
  RejectOrgProjectRequestReasonTypeHelper,
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
  AllowedPhaseTypesHelper,
  ConstraintTypesHelper,
  ApplicabilityTypesHelper
} = require("@utils/enum-validators.util");

const { customIdRegex, mongoIdRegex, budgetRegex, timelineRegex, isoDateRegex } = require("./regex.config");

/**
 * Validation rules – single source of truth for field-level constraints.
 *
 * Shape matches what field-validation.middleware-factory.js expects:
 *   length : { min, max }   → string length check
 *   enum   : helperInstance  → enum check via helper.reverseLookup()
 *   regex  : /pattern/      → regex check (optional)
 */
const validationRules = {

  // ── Project string fields ───────────────────────────
  projectName: {
    length: { min: projectNameLength.min, max: projectNameLength.max },
  },
  projectDescription: {
    length: { min: descriptionLength.min, max: descriptionLength.max },
  },
  problemStatement: {
    length: { min: problemStatementLength.min, max: problemStatementLength.max },
  },
  projectGoal: {
    length: { min: projectGoalLength.min, max: projectGoalLength.max },
  },
  mongoId: {
    regex: mongoIdRegex
  },
  budget: {
    regex: budgetRegex
  },
  timeline:{
    regex: timelineRegex
  },

  // ── Project enum fields ────────────────────────────
  projectCreationReasonType: {
    enum: ProjectCreationReasonHelper,
  },
  projectUpdationReasonType: {
    enum: ProjectUpdationReasonHelper,
  },
  onHoldReasonType: {
    enum: ProjectOnHoldReasonHelper,
  },
  abortReasonType: {
    enum: ProjectAbortReasonHelper,
  },
  resumeReasonType: {
    enum: ProjectResumeReasonHelper,
  },
  deletionReasonType: {
    enum: ProjectDeletionReasonHelper,
  },
  phaseStatus: {
    enum: PhaseStatusHelper,
  },

  inceptionDeletionReasonType: {
    enum: InceptionDeletionReasonHelper,
  },

  // ── Reason description (shared length rule) ───────
  reasonDescription: {
    length: { min: descriptionLength.min, max: descriptionLength.max },
  },

  // ── Stakeholder fields ───────────────────────────
  userId: {
    regex: customIdRegex,
  },
  adminRole: {
    enum: AdminRoleTypesHelper,
  },
  projectRole: {
    enum: ProjectRoleTypesHelper
  },
  clientRole: {
    enum: ClientRoleTypesHelper,
  },
  stakeholderDeletionReasonType: {
    enum: StakeholderDeletionReasonHelper,
  },
  projectCategoryType: {
    enum: ProjectCategoryTypesHelper,
  },
  projectType: {
    enum: ProjectTypesHelper
  },
  priorityLevel: {
    enum: PriorityLevelsHelper
  },
  approveProjectRequestReasonType: {
    enum: ApproveProductRequestReasonTypeHelper
  },
  rejectProjectRequestReasonType: {
    enum: RejectProductRequestReasonTypeHelper
  },
  approveOrgProjectRequestReasonType: {
    enum: ApproveOrgProjectRequestReasonTypeHelper
  },
  rejectOrgProjectRequestReasonType: {
    enum: RejectOrgProjectRequestReasonTypeHelper
  },
  projectActivationReasonType: {
    enum: ProjectActivationReasonHelper
  },
  changeOwnerReasonType: {
    enum: ChangeProjectOwnerReasonsHelper
  },
  scopeType: {
    enum: ScopeTypesHelper
  },

  // ── Meeting string fields ────────────────────────
  meetingTitle: {
    length: {
      min: titleLength.min,
      max: titleLength.max
    }
  },
  meetingDescription: {
    length: {
      min: descriptionLength.min,
      max: descriptionLength.max
    }
  },

  // ── Meeting enum fields ─────────────────────────
  meetingPlatform: {
    enum: MeetingPlatformTypesHelper
  },
  meetingGroup: {
    enum: MeetingGroupsHelper
  },
  meetingCancellationReason: {
    enum: MeetingCancellationReasonsHelper
  },

  // ── Participant enum fields ──────────────────────
  participantRole: {
    enum: ParticipantTypesHelper
  },

  title: {
    length: {
      min: titleLength.min,
      max: titleLength.max
    }
  },
  description: {
    length: {
      min: descriptionLength.min,
      max: descriptionLength.max
    }
  },
  productVision: {
    length: {
      min: productVisionLength.min,
      max: productVisionLength.max
    }
  },

  // ── Comment fields ──────────────────────────────────
  commentText: {
    length: {
      min: descriptionLength.min,
      max: descriptionLength.max
    }
  },
  deletedReason: {
    length: {
      min: descriptionLength.min,
      max: descriptionLength.max
    }
  },
  parentCommentId: {
    regex: mongoIdRegex
  },

  // ── Comment entity fields ───────────────────────────
  entityType: {
    enum: CommentEntityTypesHelper
  },
  entityId: {
    regex: mongoIdRegex
  },

  // ── Workflow mode fields ────────────────────────────────
  workflowMode: {
    enum: WorkflowModesHelper
  },

  // ── Phase fields ───────────────────────────────────────
  phaseType: {
    enum: PhasesHelper
  },

  phaseDeletionReasonType: {
    enum: PhaseDeletionReasonHelper
  },
  isoDate: {
    regex: isoDateRegex
  },

  // ── Idea fields ──────────────────────────────────────
  ideaStatus: {
    enum: IdeaStatusesHelper
  },
  rejectedIdeaReasonType: {
    enum: RejectedIdeaReasonTypesHelper
  },
  deferredIdeaReasonType: {
    enum: DeferredIdeaReasonTypesHelper
  },
  revokeIdeaReasonType: {
    enum: RevokeIdeaReasonTypesHelper
  },

  // ── Requirement fields ──────────────────────────────────────────────────
  requirementStatement: {
    length: { min: 10, max: 500 }
  },
  descriptionField: {
    length: { min: 20, max: 2000 }
  },
  priorityLevel: {
    enum: PriorityLevelsHelper
  },
  requirementType: {
    enum: RequirementTypesHelper
  },
  requirementDeletionReasonType: {
    enum: RequirementDeletionReasonHelper
  },
  rejectRequirementTypes: {
    enum: RejectedReasonTypesHelper
  },
  deferRequirementTypes: {
    enum: DeferredReasonTypesHelper
  },
  issueRequirementTypes: {
    enum: IssuedReasonTypesHelper
  },
  RelationTypes: {
    enum: RelationTypesHelper
  },
  ContributionTypes: {
    enum: ContributionTypesHelper
  },
  revokeRequirementTypes: {
    enum: RevokeRequirementTypesHelper
  },
  UnlinkReasonTypes: {
    enum: UnlinkReasonTypesHelper
  },
  AllowedPhaseTypes: {
    enum: AllowedPhaseTypesHelper
  },

  // ── Constraint fields ──────────────────────────────────────────────────
  constraintType: {
    enum: ConstraintTypesHelper
  },
  applicabilityType: {
    enum: ApplicabilityTypesHelper
  }
};

module.exports = {
  validationRules
};
