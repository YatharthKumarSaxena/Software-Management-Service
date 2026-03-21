const {
  projectNameLength,
  descriptionLength,
  problemStatementLength,
  projectGoalLength
} = require("./fields-length.config");

const {
  ProjectCreationReasonHelper,
  ProjectUpdationReasonHelper,
  ProjectOnHoldReasonHelper,
  ProjectAbortReasonHelper,
  ProjectResumeReasonHelper,
  ProjectDeletionReasonHelper,
  AdminRoleTypesHelper,
  ClientRoleTypesHelper,
  StakeholderDeletionReasonHelper,
  ProjectRoleTypesHelper,
  ProjectCategoryTypesHelper,
  ProjectTypesHelper,
  PriorityLevelsHelper,
  ApproveProductRequestReasonTypeHelper,
  RejectProductRequestReasonTypeHelper
} = require("@utils/enum-validators.util");

const { customIdRegex, mongoIdRegex, budgetRegex, timelineRegex } = require("./regex.config");

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
  }
};

module.exports = {
  validationRules
};
