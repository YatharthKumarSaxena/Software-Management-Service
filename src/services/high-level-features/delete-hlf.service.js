// services/high-level-features/delete-hlf.service.js

const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases } = require("@/configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

/**
 * Soft-deletes a high-level feature.
 * Deletion reason (if provided) is added to the activity log description.
 *
 * @param {Object} params
 * @param {Object} params.hlf - The HLF document to delete
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {Object} params.project - The Project document (for criticality check and audit)
 * @param {string} params.deletionReasonDescription - Reason for deletion (optional, added to activity log)
 * @param {string} params.deletedBy - USR-prefixed custom ID of the admin deleting
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, message?: string, error?: string }}
 */
const deleteHlfService = async ({
  hlf,
  inception,
  project,
  deletionReasonDescription = null,
  deletedBy,
  auditContext,
}) => {
  try {
    // ── Store old HLF for audit ────────────────────────────────────────────
    const oldHlf = hlf.toObject ? hlf.toObject() : hlf;

    const deletedHlf = await HighLevelFeatureModel.findByIdAndUpdate(
      hlf._id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: deletedBy
        }
      },
      { new: true, runValidators: true }
    );

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId,
      currentPhase: Phases.INCEPTION,
      action: `High-level feature "${deletedHlf.title}" deleted — version bump`,
      performedBy: deletedBy,
      auditContext: auditContext
    });

    // ── Activity tracker ─────────────────────────────────────────────────────
    const { user: auditUser, device, requestId, workflowId } = auditContext || {};
    const { oldData } = prepareAuditData(oldHlf, null);

    let activityMessage = `High-level feature "${deletedHlf.title}" deleted by ${deletedBy}`;
    if (deletionReasonDescription) {
      activityMessage = `High-level feature "${deletedHlf.title}" deleted by ${deletedBy} — Reason: ${deletionReasonDescription}`;
    }

    logActivityTrackerEvent({
      user: auditUser,
      device,
      requestId,
      workflowId,
      eventType: ACTIVITY_TRACKER_EVENTS.DELETE_HLF,
      description: activityMessage,
      logOptions: {
        oldData,
        userActions: { targetId: deletedHlf._id?.toString(), performedOn: DB_COLLECTIONS.HIGH_LEVEL_FEATURES },
      }
    });

    return { success: true };

  } catch (error) {
    logWithTime(`❌ [deleteHlfService] Error caught while deleting high-level feature`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[deleteHlfService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[deleteHlfService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while deleting high-level feature", error: error.message };
  }
};

module.exports = { deleteHlfService };
