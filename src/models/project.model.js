// models/project.model.js

const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { customIdRegex } = require("@configs/regex.config");
const { ProjectCreationReason, ProjectUpdationReason, ProjectStatus, ProjectResumeReason, ProjectAbortReason, ProjectDeletionReason, Phases } = require("@configs/enums.config");
const {
  projectNameLength,
  descriptionLength,
  problemStatementLength,
  projectGoalLength,
} = require("@configs/fields-length.config");

/**
 * Project Schema
 *
 * `version` is managed automatically:
 *   - Set to "v1.0" on creation
 *   - Minor digit incremented (v1.0 → v1.1 → v1.2 …) on every update
 *
 * `createdAt` / `updatedAt` are provided by `timestamps: true`.
 * `updatedBy` is optionally populated on each PATCH request.
 */
const projectSchema = new mongoose.Schema(
  {
    /* ── Core fields ─────────────────────────────────────────────────── */

    name: {
      type: String,
      required: [true, "Project name is required."],
      trim: true,
      minlength: [projectNameLength.min, `Project name must be at least ${projectNameLength.min} characters.`],
      maxlength: [projectNameLength.max, `Project name must not exceed ${projectNameLength.max} characters.`],
    },

    description: {
      type: String,
      required: [true, "Project description is required."],
      trim: true,
      minlength: [descriptionLength.min, `Description must be at least ${descriptionLength.min} characters.`],
      maxlength: [descriptionLength.max, `Description must not exceed ${descriptionLength.max} characters.`],
    },

    problemStatement: {
      type: String,
      required: [true, "Problem statement is required."],
      trim: true,
      minlength: [problemStatementLength.min, `Problem statement must be at least ${problemStatementLength.min} characters.`],
      maxlength: [problemStatementLength.max, `Problem statement must not exceed ${problemStatementLength.max} characters.`],
    },

    goal: {
      type: String,
      required: [true, "Project goal is required."],
      trim: true,
      minlength: [projectGoalLength.min, `Goal must be at least ${projectGoalLength.min} characters.`],
      maxlength: [projectGoalLength.max, `Goal must not exceed ${projectGoalLength.max} characters.`],
    },

    /* ── Version (auto-managed) ─────────────────────────────────────── */

    version: {
      type: String,
      default: "v1.0",
    },

    /* ── Audit trail ────────────────────────────────────────────────── */

    createdBy: {
      type: String,
      required: [true, "createdBy is required."],
      match: [customIdRegex, "createdBy must be a valid USR ID (USR followed by 7 digits)."],
      immutable: true,
    },

    updatedBy: {
      type: String,
      default: null,
      match: [customIdRegex, "updatedBy must be a valid USR ID (USR followed by 7 digits)."],
    },

    /* ── Reason trail ───────────────────────────────────────────────── */

    projectCreationReasonType: {
      type: String,
      required: [true, "Project creation reason is required."],
      enum: {
        values: Object.values(ProjectCreationReason),
        message: `projectCreationReason must be one of: ${Object.values(ProjectCreationReason).join(", ")}`
      },
    },

    projectCreationReasonDescription: {
      type: String,
      default: null,
      trim: true,
      minlength: descriptionLength.min,
      maxlength: descriptionLength.max,
    },

    projectUpdationReasonType: {
      type: String,
      default: null,
      enum: {
        values: [null, ...Object.values(ProjectUpdationReason)],
        message: `projectUpdationReason must be one of: ${Object.values(ProjectUpdationReason).join(", ")}`
      },
    },

    projectUpdationReasonDescription: {
      type: String,
      default: null,
      trim: true,
      minlength: descriptionLength.min,
      maxlength: descriptionLength.max,
    },

    /* ── Status tracking ────────────────────────────────────────────── */

    projectStatus: {
      type: String,
      default: ProjectStatus.DRAFT,
      enum: {
        values: Object.values(ProjectStatus),
        message: `projectStatus must be one of: ${Object.values(ProjectStatus).join(", ")}`
      },
    },

    abortReasonType: {
      type: String,
      default: null,
      enum: {
        values: Object.values(ProjectAbortReason),
        message: `abortReasonType must be one of: ${Object.values(ProjectAbortReason).join(", ")}`
      }
    },

    abortReasonDescription: {
      type: String,
      default: null,
      trim: true,
      minlength: descriptionLength.min,
      maxlength: descriptionLength.max,
    },

    resumeReasonType: {
      type: String,
      default: null,
      enum: {
        values: Object.values(ProjectResumeReason),
        message: `resumeReasonType must be one of: ${Object.values(ProjectResumeReason).join(", ")}`
      }
    },

    resumeReasonDescription: {
      type: String,
      default: null,
      trim: true,
      minlength: descriptionLength.min,
      maxlength: descriptionLength.max,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    abortedAt: {
      type: Date,
      default: null,
    },

    /* ── Phase tracking ───────────────────────────────────────── */

    currentPhase: {
      type: String,
      default: Phases.INCEPTION,
      enum: {
        values: Object.values(Phases),
        message: `currentPhase must be one of: ${Object.values(Phases).join(", ")}`
      },
    },

    /* ── Archive tracking ────────────────────────────────────── */

    isArchived: {
      type: Boolean,
      default: false,
    },

    archivedAt: {
      type: Date,
      default: null,
    },

    archivedBy: {
      type: String,
      default: null,
      match: [customIdRegex, "archivedBy must be a valid USR ID."],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },


    deletedAt: {
      type: Date,
      default: null
    },

    deletedBy: {
      type: String,
      default: null,
      match: [customIdRegex, "deletedBy must be a valid USR ID."]
    },

    deletionReasonType: {
      type: String,
      default: null,
      enum: {
        values: Object.values(ProjectDeletionReason),
        message: `deletionReasonType must be one of: ${Object.values(ProjectDeletionReason).join(", ")}`
      }
    },

    deletionReasonDescription: {
      type: String,
      default: null,
      trim: true,
      minlength: descriptionLength.min,
      maxlength: descriptionLength.max,
    }
  },
  {
    timestamps: true,   // createdAt + updatedAt
    versionKey: false,  // disable __v (we have our own `version` field)
    collection: DB_COLLECTIONS.PROJECTS,
  }
);

projectSchema.pre("save", function (next) {
  if (this.projectStatus === ProjectStatus.ABORTED && !this.abortedAt) {
    this.abortedAt = new Date();
  }

  if (this.projectStatus === ProjectStatus.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

const ProjectModel = mongoose.model(DB_COLLECTIONS.PROJECTS, projectSchema);

module.exports = { ProjectModel };
