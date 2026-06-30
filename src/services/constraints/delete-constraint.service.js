// services/constraints/delete-constraint.service.js

const { ConstraintModel } = require("@models/constraints.model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases } = require("@/configs/enums.config");

/**
 * Soft-deletes a constraint.
 * Deletion reason (if provided) is added to the activity log description.
 *
 * @param {Object} params
 * @param {Object} params.constraint - The Constraint document to delete
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {Object} params.project - The Project document (for criticality check and audit)
 * @param {string} params.deletionReasonDescription - Reason for deletion (optional)
 * @param {string} params.deletedBy - USR-prefixed custom ID of the admin deleting
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, message?: string, error?: string }}
 */
const deleteConstraintService = async ({
  constraint,
  inception,
  project,
  deletionReasonDescription = null,
  deletedBy,
  auditContext,
}) => {
  try {
    // ── Store old constraint for audit ─────────────────────────────────────────
    const oldConstraint = constraint.toObject ? constraint.toObject() : constraint;

    // ── Soft delete ────────────────────────────────────────────────────────────
    const deletedConstraint = await ConstraintModel.findByIdAndUpdate(
      constraint._id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: deletedBy
        }
      },
      { new: true, runValidators: true }
    );

    // ── Version control ────────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId,
      currentPhase: Phases.INCEPTION,
      action: `Constraint "${deletedConstraint.title}" deleted — version bump`,
      performedBy: deletedBy,
      auditContext
    });

    // ── Activity tracker ───────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData } = prepareAuditData(oldConstraint, null);

    let activityMessage = `Constraint "${deletedConstraint.title}" deleted by ${deletedBy}`;
    if (deletionReasonDescription) {
      activityMessage = `Constraint "${deletedConstraint.title}" deleted by ${deletedBy} — Reason: ${deletionReasonDescription}`;
    }

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_CONSTRAINT,
      activityMessage,
      {
        oldData,
        adminActions: { targetId: deletedConstraint._id?.toString() },
      }
    );

    return { success: true };

  } catch (error) {
    logWithTime(`❌ [deleteConstraintService] Error caught while deleting constraint`);
    errorMessage(error);
    if (error.name === "ValidationError") {
      logWithTime(`[deleteConstraintService] Validation Error: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while deleting constraint", error: error.message };
  }
};

module.exports = { deleteConstraintService };
