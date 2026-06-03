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
    },
    REQUIREMENTS_GOVERNANCE_MODE: {
      field: "requirementGovernanceMode",
      required: false,
      validation: validationRules.requirementGovernanceMode,
      description: "Optional requirements governance mode (enum)"
    },
    ENABLE_PHASE_GOVERNANCE: {
      field: "enablePhaseLevelGovernance",
      required: false,
      validation: null,
      description: "Optional flag to enable phase governance"
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
    },
    REQUIREMENTS_GOVERNANCE_MODE: {
      field: "requirementGovernanceMode",
      required: false,
      validation: validationRules.requirementGovernanceMode,
      description: "Optional requirements governance mode (enum)"
    },
    ENABLE_PHASE_GOVERNANCE: {
      field: "enablePhaseLevelGovernance",
      required: false,
      validation: null,
      description: "Optional flag to enable phase governance"
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

  ACTIVATE_PROJECT: {
    ACTIVATION_REASON_TYPE: {
      field: "activationReasonType",
      required: true,
      validation: validationRules.projectActivationReasonType,
      description: "Reason category for activating the project (enum)"
    },
    ACTIVATION_REASON_DESCRIPTION: {
      field: "activationReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on activation reason"
    },
  },

  // ── CHANGE PROJECT OWNER ────────────────────────────────────────────
  CHANGE_PROJECT_OWNER: {
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.userId,
      description: "USR-prefixed custom user ID of the new owner"
    },
    CHANGE_OWNER_REASON_TYPE: {
      field: "changeOwnerReasonType",
      required: true,
      validation: validationRules.changeOwnerReasonType,
      description: "Reason category for changing the owner (enum)"
    },
    DESCRIPTION: {
      field: "ownerChangeReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional description (mandatory if criticality is CRITICAL)"
    },
    PREV_OWNER_ROLE: {
      field: "prevOwnerRole",
      required: false,
      validation: validationRules.projectRole,
      description: "New role for the previous owner (optional, cannot be owner type; if not provided, defaults to analyst)"
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
    },
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phase,
      description: "The phase to which the stakeholder belongs"
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

  // ── CREATE SCOPE ──────────────────────────────────────────────────────
  CREATE_SCOPE: {
    TITLE: {
      field: "title",
      required: true,
      validation: validationRules.title,
      description: "Scope title (required)"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.description,
      description: "Detailed scope description (optional)"
    },
    TYPE: {
      field: "type",
      required: false,
      validation: null,
      description: "Scope type: IN_SCOPE | OUT_SCOPE | CONSTRAINT (optional, defaults to IN_SCOPE)"
    },
    LINKED_HLF_ID: {
      field: "linkedHlfId",
      required: false,
      validation: validationRules.mongoId,
      description: "Linked high-level feature ID (optional, must be valid MongoDB ObjectId if provided)"
    }
  },

  // ── UPDATE SCOPE ──────────────────────────────────────────────────────
  UPDATE_SCOPE: {
    TITLE: {
      field: "title",
      required: false,
      validation: validationRules.title,
      description: "Updated scope title (optional)"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.description,
      description: "Updated scope description (optional)"
    },
    TYPE: {
      field: "type",
      required: false,
      validation: validationRules.scopeType,
      description: "Updated scope type: IN_SCOPE | OUT_SCOPE | CONSTRAINT (optional)"
    },
    LINKED_HLF_ID: {
      field: "linkedHlfId",
      required: false,
      validation: validationRules.mongoId,
      description: "Linked high-level feature ID (optional, must be valid MongoDB ObjectId if provided)"
    }
  },

  // ── DELETE SCOPE ──────────────────────────────────────────────────────
  DELETE_SCOPE: {
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Reason for scope deletion (optional string, added to activity log)"
    }
  },

  // ── CREATE HIGH-LEVEL FEATURE ──────────────────────────────────────────────────────
  CREATE_HLF: {
    TITLE: {
      field: "title",
      required: true,
      validation: validationRules.title,
      description: "High-level feature title (required)"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.description,
      description: "Detailed high-level feature description (optional)"
    },
    LINKED_IDEA_ID: {
      field: "linkedIdeaId",
      required: false,
      validation: validationRules.mongoId,
      description: "Linked idea ID (optional, must be valid MongoDB ObjectId if provided)"
    }
  },

  // ── UPDATE HIGH-LEVEL FEATURE ──────────────────────────────────────────────────────
  UPDATE_HLF: {
    TITLE: {
      field: "title",
      required: false,
      validation: validationRules.title,
      description: "Updated high-level feature title (optional)"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.description,
      description: "Updated high-level feature description (optional)"
    },
    LINKED_IDEA_ID: {
      field: "linkedIdeaId",
      required: false,
      validation: validationRules.mongoId,
      description: "Linked idea ID (optional, must be valid MongoDB ObjectId if provided)"
    }
  },

  // ── DELETE HIGH-LEVEL FEATURE ──────────────────────────────────────────────────────
  DELETE_HLF: {
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Reason for high-level feature deletion (optional string, added to activity log)"
    }
  },
  // ── CREATE IDEA ────────────────────────────────────────────────────────────────────────
  CREATE_IDEA: {
    TITLE: {
      field: "title",
      required: true,
      validation: validationRules.title,
      description: "Idea title (required)"
    },
    DESCRIPTION: {
      field: "description",
      required: true,
      validation: validationRules.description,
      description: "Detailed idea description (required)"
    }
  },

  // ── UPDATE IDEA ────────────────────────────────────────────────────────────────────────
  UPDATE_IDEA: {
    TITLE: {
      field: "title",
      required: false,
      validation: validationRules.title,
      description: "Updated idea title (optional)"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.description,
      description: "Updated idea description (optional)"
    }
  },

  // ── ACCEPT/REJECT/DEFER IDEA ──────────────────────────────────────────────────────────
  ACCEPT_IDEA: {
    // No extra fields needed - just status change
  },

  REJECT_IDEA: {
    REJECTED_REASON_TYPE: {
      field: "rejectedReasonType",
      required: true,
      validation: validationRules.rejectedIdeaReasonType,
      description: "Reason type for rejection (required enum)"
    },
    NOT_ACCEPTED_REASON_DESCRIPTION: {
      field: "notAcceptedReasonDescription",
      required: true,
      validation: validationRules.reasonDescription,
      description: "Detailed reason for rejection (required)"
    }
  },

  DEFER_IDEA: {
    DEFERRED_REASON_TYPE: {
      field: "deferredReasonType",
      required: true,
      validation: validationRules.deferredIdeaReasonType,
      description: "Reason type for deferral (required enum)"
    },
    NOT_ACCEPTED_REASON_DESCRIPTION: {
      field: "notAcceptedReasonDescription",
      required: true,
      validation: validationRules.reasonDescription,
      description: "Detailed reason for deferral (required)"
    }
  },

  // ── REOPEN IDEA ────────────────────────────────────────────────────────────────────────
  REOPEN_IDEA: {
    // No extra fields needed - just status change
  },

  REVOKE_IDEA: {
    REVOKE_REASON_TYPE: {
      field: "revokeReasonType",
      required: true,
      validation: validationRules.revokeIdeaReasonType,
      description: "Reason type for revocation (required enum)"
    },
    REVOKE_REASON_DESCRIPTION: {
      field: "revokeReasonDescription",
      required: false, // Will be conditional based on project criticality
      validation: validationRules.reasonDescription,
      description: "Detailed reason for revocation (required if project criticality is HIGH, else optional)"
    }
  },

  // ── DELETE IDEA ────────────────────────────────────────────────────────────────────────
  DELETE_IDEA: {
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Reason for idea deletion (optional string, added to activity log)"
    }
  },

  // ── CREATE PRODUCT VISION ──────────────────────────────────────────────────────
  CREATE_PRODUCT_VISION: {
    PRODUCT_VISION: {
      field: "productVision",
      required: true,
      validation: validationRules.productVision,
      description: "Product vision statement (required)"
    }
  },

  // ── UPDATE PRODUCT VISION ──────────────────────────────────────────────────────
  UPDATE_PRODUCT_VISION: {
    PRODUCT_VISION: {
      field: "productVision",
      required: true,
      validation: validationRules.productVision,
      description: "Updated product vision statement (required)"
    }
  },

  // ── DELETE PRODUCT VISION ──────────────────────────────────────────────────────
  DELETE_PRODUCT_VISION: {
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Reason for product vision deletion (optional string, added to activity log)"
    }
  },

  // ── CREATE COMMENT ─────────────────────────────────────────────────────────────
  CREATE_COMMENT: {
    COMMENT_TEXT: {
      field: "commentText",
      required: true,
      validation: validationRules.commentText,
      description: "Comment text content (required, length validated)"
    },
    PARENT_COMMENT_ID: {
      field: "parentCommentId",
      required: false,
      validation: validationRules.parentCommentId,
      description: "Parent comment ID for replies (optional, must be valid MongoDB ObjectId if provided)"
    }
  },

  // ── CREATE COMMENT ENTITY (for entity type + id validation only) ──────────────
  COMMENT_ENTITY: {
    ENTITY_TYPE: {
      field: "entityType",
      required: true,
      validation: validationRules.entityType,
      description: "Type of entity being commented on"
    },
    ENTITY_ID: {
      field: "entityId",
      required: true,
      validation: validationRules.entityId,
      description: "ID of the entity being commented on"
    }
  },

  // ── UPDATE COMMENT ─────────────────────────────────────────────────────────────
  UPDATE_COMMENT: {
    COMMENT_TEXT: {
      field: "commentText",
      required: true,
      validation: validationRules.commentText,
      description: "Updated comment text (required, length validated)"
    }
  },

  // ── DELETE COMMENT ─────────────────────────────────────────────────────────────
  DELETE_COMMENT: {
    DELETED_REASON: {
      field: "deletedReason",
      required: false,
      validation: validationRules.deletedReason,
      description: "Reason for comment deletion (optional, added to activity log for admin actions)"
    }
  },

  DELETE_INCEPTION: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.inceptionDeletionReasonType,
      description: "Reason category for deleting inception (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on deletion reason"
    },
  },

  // ── CREATE ELICITATION ───────────────────────────────────────────
  CREATE_ELICITATION: {
    MODE: {
      field: "workflowMode",
      required: false,
      validation: validationRules.workflowMode,
      description: "Elicitation mode: OPEN | MODERATION (enum)"
    },
    REQUIREMENT_GOVERNANCE_MODE: {
      field: "requirementGovernanceMode",
      required: false,
      validation: validationRules.requirementGovernanceMode,
      description: "Requirement governance mode: PHASE | CREATED_IN_MODE | STRICT (optional, defaults to PHASE)"
    },
    ALLOW_PARALLEL_MEETINGS: {
      field: "allowParallelMeetings",
      required: false,
      validation: null,
      description: "Whether parallel meetings are allowed during elaboration (optional, defaults to false)"
    }
  },

  // ── UPDATE ELICITATION ───────────────────────────────────────────
  UPDATE_ELICITATION: {
    MODE: {
      field: "workflowMode",
      required: false,
      validation: validationRules.workflowMode,
      description: "Updated elicitation mode: OPEN | MODERATION (enum)"
    },
    REQUIREMENT_GOVERNANCE_MODE: {
      field: "requirementGovernanceMode",
      required: false,
      validation: validationRules.requirementGovernanceMode,
      description: "Updated requirement governance mode: PHASE | CREATED_IN_MODE | STRICT (optional)"
    },
    ALLOW_PARALLEL_MEETINGS: {
      field: "allowParallelMeetings",
      required: false,
      validation: null,
      description: "Whether parallel meetings are allowed during elaboration (optional, defaults to false)"
    }
  },

  // ── CREATE ELABORATION ───────────────────────────────────────────
  CREATE_ELABORATION: {
    MODE: {
      field: "workflowMode",
      required: false,
      validation: validationRules.workflowMode,
      description: "Elaboration mode: OPEN | MODERATION (enum)"
    },
    REQUIREMENT_GOVERNANCE_MODE: {
      field: "requirementGovernanceMode",
      required: false,
      validation: validationRules.requirementGovernanceMode,
      description: "Requirement governance mode: PHASE | CREATED_IN_MODE | STRICT (optional, defaults to PHASE)"
    },
    ALLOW_PARALLEL_MEETINGS: {
      field: "allowParallelMeetings",
      required: false,
      validation: null,
      description: "Whether parallel meetings are allowed during elaboration (optional, defaults to false)"
    }
  },

  // ── UPDATE ELABORATION ───────────────────────────────────────────
  UPDATE_ELABORATION: {
    MODE: {
      field: "workflowMode",
      required: false,
      validation: validationRules.workflowMode,
      description: "Updated elaboration mode: OPEN | MODERATION (enum)"
    },
    REQUIREMENT_GOVERNANCE_MODE: {
      field: "requirementGovernanceMode",
      required: false,
      validation: validationRules.requirementGovernanceMode,
      description: "Updated requirement governance mode: PHASE | CREATED_IN_MODE | STRICT (optional)"
    },
    ALLOW_PARALLEL_MEETINGS: {
      field: "allowParallelMeetings",
      required: false,
      validation: null,
      description: "Whether parallel meetings are allowed during elaboration (optional, defaults to false)"
    }
  },

  // ── CREATE NEGOTIATION ───────────────────────────────────────────
  CREATE_NEGOTIATION: {
    MODE: {
      field: "workflowMode",
      required: false,
      validation: validationRules.workflowMode,
      description: "Negotiation mode: OPEN | MODERATION (enum)"
    },
    REQUIREMENT_GOVERNANCE_MODE: {
      field: "requirementGovernanceMode",
      required: false,
      validation: validationRules.requirementGovernanceMode,
      description: "Requirement governance mode: PHASE | CREATED_IN_MODE | STRICT (optional, defaults to PHASE)"
    },
    ALLOW_PARALLEL_MEETINGS: {
      field: "allowParallelMeetings",
      required: false,
      validation: null,
      description: "Whether parallel meetings are allowed during elaboration (optional, defaults to false)"
    }
  },

  // ── UPDATE NEGOTIATION ───────────────────────────────────────────
  UPDATE_NEGOTIATION: {
    MODE: {
      field: "workflowMode",
      required: false,
      validation: validationRules.workflowMode,
      description: "Updated negotiation mode: OPEN | MODERATION (enum)"
    },
    REQUIREMENT_GOVERNANCE_MODE: {
      field: "requirementGovernanceMode",
      required: false,
      validation: validationRules.requirementGovernanceMode,
      description: "Updated requirement governance mode: PHASE | CREATED_IN_MODE | STRICT (optional)"
    },
    ALLOW_PARALLEL_MEETINGS: {
      field: "allowParallelMeetings",
      required: false,
      validation: null,
      description: "Whether parallel meetings are allowed during elaboration (optional, defaults to false)"
    }
  },

  // ── DELETE ELICITATION ───────────────────────────────────────────
  DELETE_ELICITATION: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.phaseDeletionReasonType,
      description: "Reason category for deleting elicitation (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional description (mandatory if criticality = HIGH)"
    },
  },

  // ── DELETE NEGOTIATION ───────────────────────────────────────────────
  DELETE_NEGOTIATION: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.phaseDeletionReasonType,
      description: "Reason category for deleting negotiation (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional description for deletion"
    },
  },

  // ── DELETE SPECIFICATION ─────────────────────────────────────────────
  DELETE_SPECIFICATION: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.phaseDeletionReasonType,
      description: "Reason category for deleting specification (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional description for deletion"
    },
  },

  // ── DELETE ELABORATION ───────────────────────────────────────────────
  DELETE_ELABORATION: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.phaseDeletionReasonType,
      description: "Reason category for deleting elaboration (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional description for deletion"
    },
  },

  // ── DELETE VALIDATION ────────────────────────────────────────────────
  DELETE_VALIDATION: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.phaseDeletionReasonType,
      description: "Reason category for deleting validation (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional description for deletion"
    },
  },

  // ── CREATE MEETING ───────────────────────────────────────────────────
  CREATE_MEETING: {
    TITLE: {
      field: "title",
      required: true,
      validation: validationRules.meetingTitle,
      description: "Meeting title (required)"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.meetingDescription,
      description: "Meeting description (optional)"
    },
    FACILITATOR_ID: {
      field: "facilitatorId",
      required: false,
      validation: validationRules.userId,
      description: "Facilitator ID (optional, will default to createdBy)"
    },
    MEETING_GROUP: {
      field: "meetingGroup",
      required: false,
      validation: validationRules.meetingGroup,
      description: "Meeting functional group (optional, enum)"
    },
    PLATFORM: {
      field: "platform",
      required: false,
      validation: validationRules.meetingPlatform,
      description: "Meeting platform type (optional, enum)"
    }
  },

  // ── UPDATE MEETING ───────────────────────────────────────────────────
  UPDATE_MEETING: {
    TITLE: {
      field: "title",
      required: false,
      validation: validationRules.meetingTitle,
      description: "Updated meeting title"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.meetingDescription,
      description: "Updated meeting description"
    },
    FACILITATOR_ID: {
      field: "facilitatorId",
      required: false,
      validation: validationRules.userId,
      description: "Updated facilitator ID (optional)"
    },
    MEETING_GROUP: {
      field: "meetingGroup",
      required: false,
      validation: validationRules.meetingGroup,
      description: "Updated meeting group (optional, enum)"
    },
    PLATFORM: {
      field: "platform",
      required: false,
      validation: validationRules.meetingPlatform,
      description: "Updated platform type (optional, enum)"
    }
  },

  // ── CANCEL MEETING ───────────────────────────────────────────────────
  CANCEL_MEETING: {
    CANCELLATION_REASON: {
      field: "cancelReason",
      required: false,
      validation: validationRules.meetingCancellationReason,
      description: "Cancellation reason (optional, required for HIGH/CRITICAL criticality)"
    },
    CANCELLATION_DESCRIPTION: {
      field: "cancelDescription",
      required: false,
      validation: validationRules.description,
      description: "Cancellation description (optional)"
    }
  },

  // ── SCHEDULE MEETING ─────────────────────────────
  SCHEDULE_MEETING: {
    SCHEDULED_AT: {
      field: "scheduledAt",
      required: true,
      validation: validationRules.isoDate,
      description: "When meeting is scheduled (required, ISO date)"
    },
    MEETING_LINK: {
      field: "meetingLink",
      required: true,
      validation: null,
      description: "Meeting link/URL (required, format validated by service)"
    },
    MEETING_PASSWORD: {
      field: "meetingPassword",
      required: false,
      validation: null,
      description: "Meeting password/access code (optional)"
    },
    PLATFORM: {
      field: "platform",
      required: false,
      validation: validationRules.meetingPlatform,
      description: "Meeting platform type (optional, enum, defaults to existing)"
    },
    EXPECTED_DURATION: {
      field: "expectedDuration",
      required: false,
      validation: null,
      description: "Expected meeting duration in minutes (optional, 15-480, defaults to 60)"
    }
  },

  // ── RESCHEDULE MEETING ───────────────────────────
  RESCHEDULE_MEETING: {
    SCHEDULED_AT: {
      field: "scheduledAt",
      required: false,
      validation: validationRules.isoDate,
      description: "New scheduled time (optional, ISO date)"
    },
    MEETING_LINK: {
      field: "meetingLink",
      required: false,
      validation: null,
      description: "New meeting link/URL (optional, format validated by service)"
    },
    PLATFORM: {
      field: "platform",
      required: false,
      validation: validationRules.meetingPlatform,
      description: "New platform type (optional, enum)"
    },
    MEETING_PASSWORD: {
      field: "meetingPassword",
      required: false,
      validation: null,
      description: "New meeting password (optional)"
    }
  },

  // ── ADD PARTICIPANT ──────────────────────────────
  ADD_PARTICIPANT: {
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.userId,
      description: "USR-prefixed custom user ID of participant to add (required)"
    },
    ROLE_DESCRIPTION: {
      field: "roleDescription",
      required: false,
      validation: validationRules.title,
      description: "Custom role description e.g., SCRIBE, OBSERVER (optional)"
    }
  },

  // ── UPDATE PARTICIPANT ──────────────────────────────
  UPDATE_PARTICIPANT: {
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.userId,
      description: "USR-prefixed custom user ID of participant to update (required)"
    },
    ROLE_DESCRIPTION: {
      field: "roleDescription",
      required: false,
      validation: validationRules.title,
      description: "Updated role description (optional)"
    }
  },
  REMOVE_PARTICIPANT: {
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.userId,
      description: "USR-prefixed custom user ID of participant to remove (required)"
    },
    REMOVAL_REASON: {
      field: "removeReason",
      required: false,
      validation: validationRules.description,
      description: "Reason for participant removal (optional, required for HIGH/CRITICAL criticality)"
    }
  },

  // ── CREATE ORG PROJECT REQUEST ──────────────────────────
  CREATE_ORG_PROJECT_REQUEST: {
    PROJECT_ID: {
      field: "projectId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the org project to request access to (required)"
    },
    ORGANIZATION_ID: {
      field: "organizationId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the organization (required)"
    },
    reason: {
      field: "reason",
      required: true,
      validation: validationRules.reasonDescription,
      description: "Reason for requesting access to the org project (required)"
    }
  },

  // ── APPROVE ORG PROJECT REQUEST ──────────────────────────
  APPROVE_ORG_PROJECT_REQUEST: {
    REASON_TYPE: {
      field: "approveReasonType",
      required: true,
      validation: validationRules.approveOrgProjectRequestReasonType,
      description: "Reason for approval (required enum)"
    },
    REASON_DESCRIPTION: {
      field: "approveReasonDescription",
      required: true,
      validation: validationRules.reasonDescription,
      description: "Detailed reason for approval (required)"
    }
  },

  // ── REJECT ORG PROJECT REQUEST ──────────────────────────
  REJECT_ORG_PROJECT_REQUEST: {
    REASON_TYPE: {
      field: "rejectReasonType",
      required: true,
      validation: validationRules.rejectOrgProjectRequestReasonType,
      description: "Reason for rejection (required enum)"
    },
    REASON_DESCRIPTION: {
      field: "rejectReasonDescription",
      required: true,
      validation: validationRules.reasonDescription,
      description: "Detailed reason for rejection (required)"
    }
  },

  // ── UPDATE ORG PROJECT REQUEST ──────────────────────────
  UPDATE_ORG_PROJECT_REQUEST: {
    PROJECT_ID: {
      field: "projectId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the org project to request access to (required)"
    },
    ORGANIZATION_ID: {
      field: "organizationId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the organization (required)"
    },
    reason: {
      field: "reason",
      required: true,
      validation: validationRules.reasonDescription,
      description: "Reason for requesting access to the org project (required)"
    }
  },

  // ── REQUIREMENT ───────────────────────────────────────────────────────────
  CREATE_REQUIREMENT: {
    TITLE: {
      field: "title",
      required: true,
      validation: validationRules.requirementStatement,
      description: "Requirement statement (10-500 chars)"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional detailed description"
    },
    PRIORITY: {
      field: "priority",
      required: false,
      validation: validationRules.priorityLevel,
      description: "Priority level (HIGH, MEDIUM, LOW)"
    },
    TYPE: {
      field: "type",
      required: false,
      validation: validationRules.requirementType,
      description: "Requirement type (FUNCTIONAL, NON_FUNCTIONAL, CONSTRAINT)"
    },
    PROPOSED_DATE: {
      field: "proposedDate",
      required: false,
      validation: validationRules.isoDate,
      description: "Proposed implementation date (optional, ISO date)"
    },
    PARENT_HLF_ID: {
      field: "parentHlfId",
      required: false,
      validation: validationRules.mongoId,
      description: "ID of the parent high-level feature (optional, must be valid MongoDB ObjectId if provided)"
    },
    RELATION_TYPE: {
      field: "relationType",
      required: false,
      validation: validationRules.RelationTypes,
      description: "Type of relation to parent feature (optional, enum)"
    },
    RELATION_DESCRIPTION: {
      field: "relationshipNotes",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional description of the relation to parent feature"
    },
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase for the requirement (optional, for multi-phase scenarios)"
    }
  },

  UPDATE_REQUIREMENT: {
    REQUIREMENT_STATEMENT: {
      field: "title",
      required: false,
      validation: validationRules.title,
      description: "Requirement statement (DRAFT only)"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional detailed description"
    },
    PRIORITY: {
      field: "priority",
      required: false,
      validation: validationRules.priorityLevel,
      description: "Priority level"
    },
    TYPE: {
      field: "type",
      required: false,
      validation: validationRules.requirementType,
      description: "Requirement type"
    },
    PROPOSED_DATE: {
      field: "proposedDate",
      required: false,
      validation: validationRules.isoDate,
      description: "Proposed implementation date (optional, ISO date)"
    },
    PARENT_HLF_ID: {
      field: "parentHlfId",
      required: false,
      validation: validationRules.mongoId,
      description: "ID of the parent high-level feature (optional, must be valid MongoDB ObjectId if provided)"
    },
    RELATION_TYPE: {
      field: "relationType",
      required: false,
      validation: validationRules.RelationTypes,
      description: "Type of relation to parent feature (optional, enum)"
    },
    RELATION_DESCRIPTION: {
      field: "relationshipNotes",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional description of the relation to parent feature"
    },
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase for the requirement (optional, for multi-phase scenarios)"
    }
  },

  DELETE_REQUIREMENT: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.requirementDeletionReasonType,
      description: "Reason for deletion (required)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional deletion reason description"
    },
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase for the requirement (optional, for multi-phase scenarios)"
    }
  },

  TRANSITION_REQUIREMENT_TO_REVIEW: {
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase for the requirement (optional, for multi-phase scenarios)"
    }
  },

  ISSUE_REQUIREMENT: {
    REASON_TYPE: {
      field: "reasonType",
      required: true,
      validation: validationRules.issueRequirementTypes,
      description: "Reason for issuing the requirement (required enum)"
    },
    REASON_DESCRIPTION: {
      field: "reasonDescription",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional reason for issue"
    },
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase for the requirement (optional, for multi-phase scenarios)"
    }
  },

  ACCEPT_REQUIREMENT: {
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase to assign when accepting (optional, for multi-phase scenarios)"
    }
    // No additional fields
  },

  REJECT_REQUIREMENT: {
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase to assign when rejecting (optional, for multi-phase scenarios)"
    },
    REASON_TYPE: {
      field: "reasonType",
      required: true,
      validation: validationRules.rejectRequirementTypes,
      description: "Reason for rejecting the requirement (required enum)"
    },
    REASON_DESCRIPTION: {
      field: "reasonDescription",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional rejection reason"
    }
  },

  REVERT_TO_DRAFT: {
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase (optional, for multi-phase scenarios)"
    }
  },

  ASSIGN_REQUIREMENT: {
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the user to assign the requirement to (required)"
    },
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase (optional, for multi-phase scenarios)"
    }
  },

  UNASSIGN_REQUIREMENT: {
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the user to unassign from the requirement (required)"
    },
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase (optional, for multi-phase scenarios)"
    }
  },

  ASSIGN_COLLABORATOR: {
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the user to assign as collaborator (required)"
    }
  },

  UNASSIGN_COLLABORATOR: {
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the collaborator to unassign (required)"
    }
  },

  REVOKE_REQUIREMENT: {
    PHASE: {
      field: "phase",
      required: false,
      validation: validationRules.phaseType,
      description: "Specific phase to assign when deferring (optional, for multi-phase scenarios)"
    },
    REASON_TYPE: {
      field: "reasonType",
      required: true,
      validation: validationRules.revokeRequirementTypes,
      description: "Reason for revoking the requirement (required enum)"
    },
    REASON_DESCRIPTION: {
      field: "reasonDescription",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional reason for revocation"
    }
  },

  DEFER_REQUIREMENT: {
    REASON_TYPE: {
      field: "reasonType",
      required: true,
      validation: validationRules.deferRequirementTypes,
      description: "Reason for deferring the requirement (required enum)"
    },
    REASON_DESCRIPTION: {
      field: "reasonDescription",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional reason for deferral"
    }
  },
  
  LINK_REQUIREMENT_TO_HLF: {
    HIGH_LEVEL_FEATURE_ID: {
      field: "highLevelFeatureId",
      required: true,
      validation: validationRules.mongoId,
      description: "ID of the high-level feature to link to (required)"
    },
    RELATION_TYPE: {
      field: "relationType",
      required: true,
      validation: validationRules.RelationTypes,
      description: "Type of relation between requirement and feature (required enum)"
    },
    RELATIONSHIP_NOTES: {
      field: "relationshipNotes",
      required: false,
      validation: validationRules.descriptionField,
      description: "Optional description of the relation"
    },
    CONTRIBUTION_TYPES: {
      field: "contributionTypes",
      required: true,
      validation: validationRules.ContributionTypes,
      description: "Types of contribution to the feature (required enum, array)"
    }
  },

  // ── COMMON PHASE FIELD (optional, for multi-phase scenarios) ───
  PHASE: {
    field: "phase",
    required: false,
    validation: validationRules.phaseType,
    description: "Specific phase to assign when multiple phases are active (optional)"
  },

UPDATE_REQUIREMENT_TO_HLF: {
  RELATIONSHIP_NOTES: {
    field: "relationshipNotes",
    required: false,
    validation: validationRules.descriptionField,
    description: "Updated description of relation between requirement and HLF (optional)"
  },
  RELATION_TYPE: {
    field: "relationType",
    required: false,
    validation: validationRules.RelationTypes,
    description: "Updated type of relation between requirement and feature (optional enum)"
  }
},

UNLINK_REQUIREMENT_TO_HLF: {
  UNLINK_REASON: {
    field: "unlinkReason",
    required: true,
    validation: validationRules.UnlinkReasonTypes,
    description: "Reason for unlinking requirement from HLF (required enum)"
  },
  UNLINK_DESCRIPTION: {
    field: "unlinkDescription",
    required: false,
    validation: validationRules.descriptionField,
    description: "Optional description of the unlink reason"
  }
},

PHASE_ROLE_ACTION: {
  PHASE_TYPE: {
    field: "phaseType",
    required: true,
    validation: validationRules.AllowedPhaseTypes,
    description: "Phase to assign the role for (required)"
  }
}

};

module.exports = { FieldDefinitions };
