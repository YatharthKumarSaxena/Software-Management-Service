// services/constraints/create-constraint.service.js

const { ConstraintModel } = require("@models/constraints.model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases, ApplicabilityTypes } = require("@/configs/enums.config");
const { counterServices } = require("@services/common/counter.service");

/**
 * Creates a new constraint for a project's current inception phase.
 *
 * @param {Object} params
 * @param {Object} params.inception - The Inception document
 * @param {string} params.projectId - Project ID (required)
 * @param {string} params.title - Constraint title (required)
 * @param {string} params.description - Constraint description (optional)
 * @param {string} params.type - ConstraintType enum (required)
 * @param {string} params.type - ConstraintType enum (required)
 * @param {string} params.createdBy - USR-prefixed custom ID of the admin creating the constraint
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, constraint?: Object, message?: string, error?: string }}
 */
const createConstraintService = async ({
  inception,
  projectId,
  title,
  description = null,
  type,
  createdBy,
  auditContext,
}) => {
  try {
    const inceptionId = inception._id.toString();

    // ── Normalize title ───────────────────────────────────────────────────────
    const normalizedTitle = title.trim().replace(/\s+/g, " ");
    const normalizedDescription = description?.trim() || null;

    // ── Guard: prevent duplicate constraint title per project ─────────────────
    const existing = await ConstraintModel.findOne({
      projectId,
      title: normalizedTitle,
      isDeleted: false
    }).collation({ locale: "en", strength: 2 });

    if (existing) {
      return { success: false, message: "Constraint with this title already exists in this project." };
    }

    // ── Counter service ───────────────────────────────────────────────────────
    const counterResult = await counterServices.constraintCounterService(projectId);
    if (!counterResult.success) {
      logWithTime(`❌ [createConstraintService] Error generating Constraint sequence for project: ${projectId}`);
      return { success: false, message: "Failed to generate Constraint sequence" };
    }

    // ── Create constraint ─────────────────────────────────────────────────────
    const constraintData = {
      inceptionId,
      projectId,
      title: normalizedTitle,
      description: normalizedDescription,
      type,
      category: ApplicabilityTypes.GLOBAL,
      featureId: null,
      sequence: counterResult.sequence,
      id: counterResult.generatedId,
      createdBy,
    };

    const constraint = await ConstraintModel.create(constraintData);

    // ── Version control ───────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId,
      currentPhase: Phases.INCEPTION,
      action: `Constraint "${normalizedTitle}" created with type ${type} — version bump`,
      performedBy: createdBy,
      auditContext
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_CONSTRAINT,
      `Constraint "${normalizedTitle}" created for inception ${inceptionId} with type ${type} by ${createdBy}`,
      {
        newData: prepareAuditData(null, constraint).newData,
        adminActions: { targetId: constraint._id?.toString() },
      }
    );

    return { success: true, constraint };

  } catch (error) {
    logWithTime(`❌ [createConstraintService] Error caught while creating constraint`);
    errorMessage(error);
    if (error.code === 11000) {
      return { success: false, message: "Constraint with this title already exists in this project." };
    }
    if (error.name === "ValidationError") {
      logWithTime(`[createConstraintService] Validation Error: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while creating constraint", error: error.message };
  }
};

module.exports = { createConstraintService };
