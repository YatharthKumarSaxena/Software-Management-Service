// services/scopes/update-scope.service.js

const { ScopeModel } = require("@models/scope-model");
const { versionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

/**
 * Updates an existing scope with change detection.
 * Only logs activity if changes are actually detected.
 *
 * @param {Object} params
 * @param {Object} params.scope - The Scope document to update
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {Object} params.project - The Project document (for version control)
 * @param {string} params.title - Updated title (optional)
 * @param {string} params.description - Updated description (optional)
 * @param {string} params.type - Updated type (optional)
 * @param {string} params.updatedBy - USR-prefixed custom ID of the admin updating
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, scope?: Object, message?: string, error?: string }}
 */
const updateScopeService = async ({
  scope,
  inception,
  project,
  title = null,
  description = null,
  type = null,
  updatedBy,
  auditContext,
}) => {
  try {
    // ── Store old scope for comparison ────────────────────────────────────────
    const oldScope = scope.toObject ? scope.toObject() : { ...scope };

    // ── Update only provided fields ──────────────────────────────────────────
    let hasChanges = false;

    if (description !== null) {
      const normalizedDescription = description?.trim() || null;

      if (normalizedDescription !== scope.description) {
        scope.description = normalizedDescription;
        hasChanges = true;
      }
    }

    if (type !== null && type !== scope.type) {
      scope.type = type;
      hasChanges = true;
    }

    if (title !== null) {
      const normalizedTitle = title.trim();

      if (normalizedTitle !== scope.title) {

        const existing = await ScopeModel.findOne({
          inceptionId: scope.inceptionId,
          title: normalizedTitle,
          type: type !== null ? type : scope.type,
          isDeleted: false,
          _id: { $ne: scope._id }
        }).collation({ locale: "en", strength: 2 });

        if (existing) {
          return {
            success: false,
            message: "Scope with this title already exists in this inception."
          };
        }

        scope.title = normalizedTitle;
        hasChanges = true;
      }
    }

    // ── If no changes, return early ──────────────────────────────────────────
    if (!hasChanges) {
      return { success: true, message: "No changes detected", scope };
    }

    // ── Update timestamp and updatedBy ──────────────────────────────────────
    scope.updatedBy = updatedBy;
    const updatedScope = await scope.save();

    // ── Version control ────────────────────────────────────────────────────
    await versionControlService(
      inception,
      `Scope "${updatedScope.title}" updated — version bump`,
      updatedBy,
      auditContext
    );

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldScope, updatedScope);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_SCOPE,
      `Scope "${updatedScope.title}" updated by ${updatedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: updatedScope._id?.toString() },
      }
    );

    return { success: true, scope: updatedScope };

  } catch (error) {
    logWithTime(`❌ [updateScopeService] Error caught while updating scope`);
    errorMessage(error);

    if (error.code === 11000) {
      return {
        success: false,
        message: "Scope with this title already exists in this inception."
      };
    }
    if (error.name === "ValidationError") {
      logWithTime(`[updateScopeService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[updateScopeService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while updating scope", error: error.message };
  }
};

module.exports = { updateScopeService };
