// services/scopes/unlink-scope-to-hlf.service.js

const { ScopeModel } = require("@models/scope-model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { ScopeCategoryTypes } = require("@/configs/enums.config");

/**
 * Unlinks a scope from a high-level feature.
 * Sets featureId to null and category to GLOBAL.
 * If already unlinked (no featureId), returns success without tracking activity.
 * 
 * @param {Object} params
 * @param {Object} params.scope - The Scope document to unlink
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {string} params.unlinkedBy - USR-prefixed custom ID of the admin unlinking
 * @param {Object} params.auditContext - { user, device, requestId }
 * @returns {{ success: boolean, scope?: Object, message?: string, error?: string }}
 */
const unlinkScopeToHlfService = async ({
  scope,
  inception,
  unlinkedBy,
  auditContext,
}) => {
  try {
    // ── Store old Scope for comparison ──────────────────────────────────────
    const oldScope = scope.toObject ? scope.toObject() : { ...scope };

    // ── Check if already unlinked ────────────────────────────────────────────
    if (!scope.featureId) {
      logWithTime(
        `⚠️ [unlinkScopeToHlfService] Scope ${scope._id} is not linked to any feature. No changes made.`
      );
      return {
        success: true,
        message: "Scope is not linked to any feature. No changes made.",
        scope,
      };
    }

    // ── Update Scope: remove featureId and set category to GLOBAL ─────────────
    scope.featureId = null;
    scope.category = ScopeCategoryTypes.GLOBAL;
    scope.updatedBy = unlinkedBy;
    const unlinkedScope = await scope.save();

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId.toString(),
      currentPhase: "INCEPTION",
      action: `Scope "${unlinkedScope.title}" unlinked from High-level Feature (reverted to GLOBAL category) — version bump`,
      performedBy: unlinkedBy,
      auditContext: auditContext,
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldScope, unlinkedScope);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UNLINK_SCOPE_TO_HLF,
      `Scope "${unlinkedScope.title}" unlinked from High-level Feature by ${unlinkedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: unlinkedScope._id?.toString() },
      }
    );

    logWithTime(
      `✅ [unlinkScopeToHlfService] Scope ${unlinkedScope._id} successfully unlinked from HLF`
    );
    return { success: true, message: "Scope successfully unlinked from HLF", scope: unlinkedScope };
  } catch (error) {
    logWithTime(
      `❌ [unlinkScopeToHlfService] Error caught while unlinking Scope from HLF`
    );
    errorMessage(error);
    if (error.name === "ValidationError") {
      logWithTime(
        `[unlinkScopeToHlfService] Validation Error Details: ${JSON.stringify(error.errors)}`
      );
      return { success: false, message: "Validation error", error: error.message };
    }
    return {
      success: false,
      message: "Error while unlinking scope from HLF",
      error: error.message,
    };
  }
};

module.exports = { unlinkScopeToHlfService };
