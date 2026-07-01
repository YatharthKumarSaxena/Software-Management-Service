// services/constraints/update-constraint.service.js

const { ConstraintModel } = require("@models/constraints.model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases, ApplicabilityTypes } = require("@/configs/enums.config");

/**
 * Updates an existing constraint with change detection.
 * Only logs activity if changes are actually detected.
 *
 * @param {Object} params
 * @param {Object} params.constraint - The Constraint document to update
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {Object} params.project - The Project document (for version control)
 * @param {string} params.title - Updated title (optional)
 * @param {string} params.description - Updated description (optional)
 * @param {string} params.type - Updated type (optional)
 * @param {string} params.type - Updated type (optional)
 * @param {string} params.updatedBy - USR-prefixed custom ID of the admin updating
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, constraint?: Object, message?: string, error?: string }}
 */
const updateConstraintService = async ({
  constraint,
  inception,
  project,
  title = null,
  description = null,
  type = null,
  updatedBy,
  auditContext,
}) => {
  try {
    // ── Store old constraint for comparison ────────────────────────────────────
    const oldConstraint = constraint.toObject ? constraint.toObject() : { ...constraint };

    let hasChanges = false;

    // ── Description ────────────────────────────────────────────────────────────
    if (description !== null) {
      const normalizedDescription = description?.trim() || null;
      if (normalizedDescription !== constraint.description) {
        constraint.description = normalizedDescription;
        hasChanges = true;
      }
    }

    // ── Title & type ───────────────────────────────────────────────────────────
    const normalizedTitle = title !== null
      ? title.trim().replace(/\s+/g, " ")
      : constraint.title;

    const finalType = type !== null ? type : constraint.type;

    if (normalizedTitle !== constraint.title || finalType !== constraint.type) {
      const existing = await ConstraintModel.findOne({
        projectId: constraint.projectId,
        title: normalizedTitle,
        isDeleted: false,
        _id: { $ne: constraint._id }
      }).collation({ locale: "en", strength: 2 });

      if (existing) {
        return { success: false, message: "Constraint with this title already exists in this project." };
      }

      if (normalizedTitle !== constraint.title) {
        constraint.title = normalizedTitle;
        hasChanges = true;
      }
      if (finalType !== constraint.type) {
        constraint.type = finalType;
        hasChanges = true;
      }
    }

    // ── If no changes, return early ────────────────────────────────────────────
    if (!hasChanges) {
      return { success: true, message: "No changes detected", constraint };
    }

    constraint.updatedBy = updatedBy;
    const updatedConstraint = await ConstraintModel.findByIdAndUpdate(
      constraint._id,
      { $set: constraint },
      { new: true }
    ).lean();

    // ── Version control ────────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId,
      currentPhase: Phases.INCEPTION,
      action: `Constraint "${updatedConstraint.title}" updated — version bump`,
      performedBy: updatedBy,
      auditContext
    });

    // ── Activity tracker ───────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldConstraint, updatedConstraint);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_CONSTRAINT,
      `Constraint "${updatedConstraint.title}" updated by ${updatedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: updatedConstraint._id?.toString() },
      }
    );

    return { success: true, constraint: updatedConstraint };

  } catch (error) {
    logWithTime(`❌ [updateConstraintService] Error caught while updating constraint`);
    errorMessage(error);
    if (error.code === 11000) {
      return { success: false, message: "Constraint with this title already exists in this project." };
    }
    if (error.name === "ValidationError") {
      logWithTime(`[updateConstraintService] Validation Error: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while updating constraint", error: error.message };
  }
};

module.exports = { updateConstraintService };
