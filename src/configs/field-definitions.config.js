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
      field: "expectedTimelineInDays",
      required: false,
      validation: validationRules.timeline,
      description: "Optional expected timeline in months (number)"
    },
    PROJECT_TYPE: {
      field: "projectType",
      required: true,
      validation: validationRules.projectType,
      description: "Optional project type (enum)"
    },
    PROJECT_COMPLEXITY: {
      field: "projectComplexity",
      required: false,
      validation: validationRules.projectComplexity,
      description: "Optional project complexity level (enum)"
    },
    PROJECT_CRITICALITY: {
      field: "projectCriticality",
      required: false,
      validation: validationRules.projectCriticality,
      description: "Optional project criticality level (enum)"
    },
    PROJECT_PRIORITY: {
      field: "projectPriority",
      required: false,
      validation: validationRules.priorityLevel,
      description: "Optional project priority level (enum)"
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
    EXPECTED_BUDGET: {
      field: "expectedBudget",
      required: false,
      validation: null,
      description: "Optional expected budget (number)"
    },
    EXPECTED_TIMELINE: {
      field: "expectedTimelineInDays",
      required: false,
      validation: null,
      description: "Optional expected timeline in months (number)"
    },
    PROJECT_COMPLEXITY: {
      field: "projectComplexity",
      required: false,
      validation: validationRules.projectComplexity,
      description: "Optional project complexity level (enum)"
    },
    PROJECT_CRITICALITY: {
      field: "projectCriticality",
      required: false,
      validation: validationRules.projectCriticality,
      description: "Optional project criticality level (enum)"
    },
    PROJECT_PRIORITY: {
      field: "projectPriority",
      required: false,
      validation: validationRules.priorityLevel,
      description: "Optional project priority level (enum)"
    }
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
    }
  },

  // ── DELETE STAKEHOLDER ────────────────────────────────────────────────
  DELETE_STAKEHOLDER: {
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

  // ── CREATE PRODUCT REQUEST ────────────────────────────────────────────
  CREATE_PRODUCT_REQUEST: {
    TITLE: {
      field: "title",
      required: true,
      validation: validationRules.projectName,
      description: "Product request title"
    },
    DESCRIPTION: {
      field: "description",
      required: true,
      validation: validationRules.projectDescription,
      description: "Detailed description of the product request"
    },
    PROJECT_TYPE: {
      field: "projectType",
      required: true,
      validation: validationRules.projectType,
      description: "Type of project"
    },
    PROJECT_CATEGORY: {
      field: "projectCategory",
      required: true,
      validation: validationRules.projectCategoryType,
      description: "Category of project"
    },
    PRIORITY: {
      field: "priority",
      required: false,
      validation: validationRules.priorityLevel,
      description: "Priority level of the request"
    },
    EXPECTED_TIMELINE_DAYS: {
      field: "expectedTimelineInDays",
      required: false,
      validation: null,
      description: "Expected timeline in days (must be at least 1)"
    },
    BUDGET: {
      field: "budget",
      required: false,
      validation: null,
      description: "Optional budget"
    }
  },

  // ── UPDATE PRODUCT REQUEST ────────────────────────────────────────────
  UPDATE_PRODUCT_REQUEST: {
    TITLE: {
      field: "title",
      required: false,
      validation: validationRules.projectName,
      description: "Updated product request title"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.projectDescription,
      description: "Updated product request description"
    },
    PROJECT_TYPE: {
      field: "projectType",
      required: false,
      validation: validationRules.projectType,
      description: "Updated project type"
    },
    PROJECT_CATEGORY: {
      field: "projectCategory",
      required: false,
      validation: validationRules.projectCategoryType,
      description: "Updated project category"
    },
    PRIORITY: {
      field: "priority",
      required: false,
      validation: validationRules.priorityLevel,
      description: "Updated priority level"
    },
    EXPECTED_TIMELINE_DAYS: {
      field: "expectedTimelineInDays",
      required: false,
      validation: null,
      description: "Updated expected timeline in days"
    },
    BUDGET: {
      field: "budget",
      required: false,
      validation: null,
      description: "Updated budget"
    }
  },

  // ── DELETE PRODUCT REQUEST ────────────────────────────────────────────
  DELETE_PRODUCT_REQUEST: {
    DELETION_REASON: {
      field: "deletionReason",
      required: true,
      validation: validationRules.reasonDescription,
      description: "For admin deletion: reason description (compulsory); for client: optional"
    }
  },

  // ── APPROVE PRODUCT REQUEST ──────────────────────────────────────────
  APPROVE_PRODUCT_REQUEST: {
    REASON_TYPE: {
      field: "reasonType",
      required: true,
      validation: validationRules.approveProjectRequestReasonType,
      description: "Type of approval reason (compulsory)"
    },
    REASON_DESCRIPTION: {
      field: "reasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional approval description"
    }
  },

  // ── REJECT PRODUCT REQUEST ───────────────────────────────────────────
  REJECT_PRODUCT_REQUEST: {
    REASON_TYPE: {
      field: "reasonType",
      required: true,
      validation: validationRules.rejectProjectRequestReasonType,
      description: "Type of rejection reason (compulsory)"
    },
    REASON_DESCRIPTION: {
      field: "reasonDescription",
      required: true,
      validation: validationRules.reasonDescription,
      description: "Rejection description (compulsory)"
    }
  },

};

module.exports = { FieldDefinitions };
