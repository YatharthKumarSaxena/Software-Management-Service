/**
 * CENTRALIZED FIELD DEFINITIONS CONFIG
 *
 * Single Source of Truth for:
 * - Required fields per endpoint/action
 * - Validation rules mapping
 * - Field-level metadata
 *
 * NOTE: createdBy / updatedBy are NOT listed here because they are
 * derived from req.admin.adminId inside the controller —
 * callers must never send them in the request body.
 */

const { validationRules } = require("./validation.config");

const FieldDefinitions = {

  // ── CREATE PROJECT ───────────────────────────────────────────────────
  CREATE_PROJECT: {
    NAME: {
      field: "name",
      required: true,
      validation: validationRules.projectName,
      description: "Human-readable project name"
    },
    DESCRIPTION: {
      field: "description",
      required: true,
      validation: validationRules.projectDescription,
      description: "Detailed description of the project"
    },
    PROBLEM_STATEMENT: {
      field: "problemStatement",
      required: true,
      validation: validationRules.problemStatement,
      description: "Problem the project aims to solve"
    },
    GOAL: {
      field: "goal",
      required: true,
      validation: validationRules.projectGoal,
      description: "Primary goal / expected outcome"
    },
    CREATION_REASON_TYPE: {
      field: "projectCreationReasonType",
      required: true,
      validation: validationRules.projectCreationReasonType,
      description: "Why is this project being created? (enum)"
    },
    CREATION_REASON_DESCRIPTION: {
      field: "projectCreationReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on creation reason"
    },
    PROJECT_CATEGORY: {
      field: "projectCategory",
      required: true,
      validation: validationRules.projectCategoryType,
      description: "Category of project: individual | organization | multi_organization"
    },
    EXPECTED_BUDGET: {
      field: "expectedBudget",
      required: false,
      validation: validationRules.budget,
      description: "Optional expected budget (number)"
    },
    EXPECTED_TIMELINE: {
      field: "expectedTimelineMonths",
      required: false,
      validation: validationRules.timeline,
      description: "Optional expected timeline in months (number)"
    },
    LINKED_PROJECT_ID: {
      field: "linkedProjectId",
      required: false,
      validation: validationRules.mongoId,
      description: "Optional MongoDB ObjectId of a related project"
    }
  },

  // ── UPDATE PROJECT ───────────────────────────────────────────────────
  UPDATE_PROJECT: {
    NAME: {
      field: "name",
      required: false,
      validation: validationRules.projectName,
      description: "Updated project name"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.projectDescription,
      description: "Updated project description"
    },
    PROBLEM_STATEMENT: {
      field: "problemStatement",
      required: false,
      validation: validationRules.problemStatement,
      description: "Updated problem statement"
    },
    GOAL: {
      field: "goal",
      required: false,
      validation: validationRules.projectGoal,
      description: "Updated project goal"
    },
    UPDATION_REASON_TYPE: {
      field: "projectUpdationReasonType",
      required: true,
      validation: validationRules.projectUpdationReasonType,
      description: "Why is this project being updated? (enum)"
    },
    UPDATION_REASON_DESCRIPTION: {
      field: "projectUpdationReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on updation reason"
    },
    ORG_ID: {
      field: "orgId",
      required: false,
      validation: validationRules.mongoId,
      description: "ORGANIZATION only: replace the single associated org"
    },
    EXPECTED_BUDGET: {
      field: "expectedBudget",
      required: false,
      validation: null,
      description: "Optional expected budget (number)"
    },
    EXPECTED_TIMELINE: {
      field: "expectedTimelineMonths",
      required: false,
      validation: null,
      description: "Optional expected timeline in months (number)"
    },
  },

  // ── ON_HOLD PROJECT ──────────────────────────────────────
  ON_HOLD_PROJECT: {
    ON_HOLD_REASON_TYPE: {
      field: "onHoldReasonType",
      required: true,
      validation: validationRules.onHoldReasonType,
      description: "Reason category for putting on hold (enum)"
    },
    ON_HOLD_REASON_DESCRIPTION: {
      field: "onHoldReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on on-hold reason"
    },
  },

  // ── ABORT PROJECT ────────────────────────────────────────────────────
  ABORT_PROJECT: {
    ABORT_REASON_TYPE: {
      field: "abortReasonType",
      required: true,
      validation: validationRules.abortReasonType,
      description: "Reason category for aborting (enum)"
    },
    ABORT_REASON_DESCRIPTION: {
      field: "abortReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on abort reason"
    },
  },

  // ── COMPLETE PROJECT (no required body fields – projectId in params) ─
  COMPLETE_PROJECT: {},

  // ── RESUME PROJECT ───────────────────────────────────────────────────
  RESUME_PROJECT: {
    RESUME_REASON_TYPE: {
      field: "resumeReasonType",
      required: true,
      validation: validationRules.resumeReasonType,
      description: "Reason category for resuming (enum)"
    },
    RESUME_REASON_DESCRIPTION: {
      field: "resumeReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on resume reason"
    },
  },

  // ── DELETE PROJECT ───────────────────────────────────────────────────
  DELETE_PROJECT: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.deletionReasonType,
      description: "Reason category for deleting (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on deletion reason"
    },
  },

  // ── ARCHIVE PROJECT (no required body fields – projectId in params) ─
  ARCHIVE_PROJECT: {},

  // ── CREATE STAKEHOLDER ────────────────────────────────────────────────
  // NOTE: role-guard middleware handles admin vs client role-type split;
  //       validation middleware only checks userId format and field presence.
  CREATE_STAKEHOLDER: {
    PROJECT_ID: {
      field: "projectId",
      required: true,
      validation: validationRules.mongoId,   // MongoID check handled in service / fetch middleware
      description: "MongoDB ObjectId of the project this stakeholder belongs to"
    },
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.userId,
      description: "USR-prefixed custom user ID of the stakeholder (admin or client)"
    },
    ROLE: {
      field: "role",
      required: true,
      validation: null,   // role-guard middleware enforces admin vs client split
      description: "ProjectRole (admin) or ClientRole (client) — enforced by role-guard"
    },
    orgId: {
      field: "orgId",
      required: false,
      validation: validationRules.mongoId,
      description: "MongoDB ObjectId of the Organization this stakeholder belongs to (derived from req.stakeholder but can be overridden)"
    }
  },

  // ── UPDATE STAKEHOLDER ────────────────────────────────────────────────
  UPDATE_STAKEHOLDER: {
    ROLE: {
      field: "role",
      required: true,
      validation: null,   // role-guard middleware enforces admin vs client split
      description: "New role to assign — must match the user's entity type"
    },
    projectId: {
      field: "projectId",
      required: true,
      validation: validationRules.mongoId,   // MongoID check handled in service / fetch middleware
      description: "MongoDB ObjectId of the project this stakeholder belongs to (derived from req.stakeholder but can be overridden)"
    },
    orgId: {
      field: "orgId",
      required: false,
      validation: validationRules.mongoId,
      description: "MongoDB ObjectId of the Organization this stakeholder belongs to (derived from req.stakeholder but can be overridden)"
    }
  },

  // ── DELETE STAKEHOLDER ────────────────────────────────────────────────
  DELETE_STAKEHOLDER: {
    projectId: {
      field: "projectId",
      required: true,
      validation: validationRules.mongoId,   // MongoID check handled in service / fetch middleware
      description: "MongoDB ObjectId of the project this stakeholder belongs to (derived from req.stakeholder but can be overridden)"
    },
    orgId: {
      field: "orgId",
      required: false,
      validation: validationRules.mongoId,
      description: "MongoDB ObjectId of the Organization this stakeholder belongs to (derived from req.stakeholder but can be overridden)"
    },
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.stakeholderDeletionReasonType,
      description: "Reason category for deleting the stakeholder (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on deletion reason"
    },
  },

};

module.exports = { FieldDefinitions };
