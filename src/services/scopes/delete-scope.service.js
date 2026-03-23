// services/scopes/delete-scope.service.js

const { ScopeModel } = require("@models/scope-model");
const { versionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

/**
 * Soft-deletes a scope.
 * Deletion reason (if provided) is added to the activity log description.
 *
 * @param {Object} params
 * @param {Object} params.scope - The Scope document to delete
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {Object} params.project - The Project document (for criticality check and audit)
 * @param {string} params.deletionReasonDescription - Reason for deletion (optional, added to activity log)
 * @param {string} params.deletedBy - USR-prefixed custom ID of the admin deleting
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, message?: string, error?: string }}
 */
const deleteScopeService = async ({
  scope,
  inception,
  project,
  deletionReasonDescription = null,
  deletedBy,
  auditContext,
}) => {
  try {
    // ── Store old scope for audit ────────────────────────────────────────────
    const oldScope = scope.toObject ? scope.toObject() : scope;

    // ── Soft delete: set isDeleted, deletedAt, deletedBy ────────────────────
    scope.isDeleted = true;
    scope.deletedAt = new Date();
    scope.deletedBy = deletedBy;

    const deletedScope = await scope.save();

    // ── Version control ────────────────────────────────────────────────────
    await versionControlService(
      inception,
      `Scope "${deletedScope.title}" deleted — version bump`,
      deletedBy,
      auditContext
    );

    // ── Activity tracker ─────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData } = prepareAuditData(oldScope, null);

    let activityMessage = `Scope "${deletedScope.title}" deleted by ${deletedBy}`;
    if (deletionReasonDescription) {
      activityMessage = `Scope "${deletedScope.title}" deleted by ${deletedBy} — Reason: ${deletionReasonDescription}`;
    }

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_SCOPE,
      activityMessage,
      {
        oldData,
        adminActions: { targetId: deletedScope._id?.toString() },
      }
    );

    return { success: true };

  } catch (error) {
    logWithTime(`❌ [deleteScopeService] Error caught while deleting scope`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[deleteScopeService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[deleteScopeService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while deleting scope", error: error.message };
  }
};

module.exports = { deleteScopeService };
