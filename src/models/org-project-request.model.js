const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { RequestStatus, ApproveOrgProjectRequestReasonType, RejectOrgProjectRequestReasonType } = require("@/configs/enums.config");
const { customIdRegex, mongoIdRegex } = require("@/configs/regex.config");
const { descriptionLength } = require("@/configs/fields-length.config");

const orgProjectRequestSchema = new mongoose.Schema(
  {
    /* ── Core References ────────────────────────────────────────── */

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DB_COLLECTIONS.PROJECTS,
      required: [true, "projectId is required."],
      index: true
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DB_COLLECTIONS.CLIENTS,
      required: [true, "clientId is required."],
      immutable: true,
      index: true
    },

    organizationId: {
      type: String,
      match: [mongoIdRegex, "organizationId must be a valid MongoDB ObjectId."],
      required: [true, "organizationId is required."],
      index: true
    },

    /* ── Status & Lifecycle ─────────────────────────────────────── */

    status: {
      type: String,
      enum: {
        values: Object.values(RequestStatus),
        message: `status must be one of: ${Object.values(RequestStatus).join(", ")}`
      },
      default: RequestStatus.PENDING,
      index: true
    },

    /* ── Approval Reason ────────────────────────────────────────── */

    approveReasonType: {
      type: String,
      enum: {
        values: Object.values(ApproveOrgProjectRequestReasonType),
        message: `approveReasonType must be one of: ${Object.values(ApproveOrgProjectRequestReasonType).join(", ")}`
      },
      default: null
    },

    approveReasonDescription: {
      type: String,
      trim: true,
      minlength: [descriptionLength.min, `approveReasonDescription must be at least ${descriptionLength.min} characters.`],
      maxlength: [descriptionLength.max, `approveReasonDescription must not exceed ${descriptionLength.max} characters.`],
      default: null
    },

    /* ── Rejection Reason ───────────────────────────────────────── */

    rejectReasonType: {
      type: String,
      enum: {
        values: Object.values(RejectOrgProjectRequestReasonType),
        message: `rejectReasonType must be one of: ${Object.values(RejectOrgProjectRequestReasonType).join(", ")}`
      },
      default: null
    },

    rejectReasonDescription: {
      type: String,
      trim: true,
      minlength: [descriptionLength.min, `rejectReasonDescription must be at least ${descriptionLength.min} characters.`],
      maxlength: [descriptionLength.max, `rejectReasonDescription must not exceed ${descriptionLength.max} characters.`],
      default: null
    },

    /* ── Lifecycle Timestamps ───────────────────────────────────── */

    approvedAt: {
      type: Date,
      default: null
    },

    rejectedAt: {
      type: Date,
      default: null
    },

    withdrawnAt: {
      type: Date,
      default: null
    },

    /* ── Audit Trail ────────────────────────────────────────────── */

    updatedBy: {
      type: String,
      match: [customIdRegex, "updatedBy must be a valid USR ID."],
      default: null
    }

  },
  {
    timestamps: true,
    versionKey: false,
    collection: DB_COLLECTIONS.ORG_PROJECT_REQUESTS
  }
);

/* ── Compound Indexes ──────────────────────────────────────── */
orgProjectRequestSchema.index({ projectId: 1, clientId: 1, status: 1 });
orgProjectRequestSchema.index({ clientId: 1, status: 1 });

const OrgProjectRequest = mongoose.model(DB_COLLECTIONS.ORG_PROJECT_REQUESTS, orgProjectRequestSchema);

module.exports = { OrgProjectRequest };
