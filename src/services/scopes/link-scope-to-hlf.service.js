// services/scopes/link-scope-to-hlf.service.js

const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases, ScopeCategoryTypes } = require("@/configs/enums.config");
const { FORBIDDEN } = require("@/configs/http-status.config");

/**
 * Links a scope to a high-level feature.
 * If featureId is provided and valid, sets category to LOCAL, otherwise GLOBAL.
 * If already linked to the same feature, returns success without tracking activity.
 * 
 * @param {Object} params
 * @param {Object} params.scope - The Scope document to link
 * @param {Object} params.hlf - The HLF document to link to
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {string} params.featureId - HLF feature ID (optional)
 * @param {string} params.linkedBy - USR-prefixed custom ID of the admin linking
 * @param {Object} params.auditContext - { user, device, requestId }
 * @returns {{ success: boolean, scope?: Object, message?: string, error?: string }}
 */
const linkScopeToHlfService = async ({
  scope,
  hlf,
  inception,
  featureId = null,
  linkedBy,
  auditContext,
}) => {
  try {
    // ── Store old Scope for comparison ──────────────────────────────────────
    const oldScope = scope.toObject ? scope.toObject() : { ...scope };
    
    const hlfId = hlf._id.toString();
    const scopeCurrentFeatureId = scope.featureId?.toString();

    if(scope.projectId.toString() !== hlf.projectId.toString()) {
      logWithTime(`❌ [linkScopeToHlfService] Scope ${scope._id} and HLF ${hlf._id} belong to different projects. Cannot link.`);
      return { success: false, message: "Scope and HLF belong to different projects.", errorCode: FORBIDDEN };
    }

    // ── Check if already linked to same feature ────────────────────────────────
    if (scopeCurrentFeatureId === hlfId) {
      logWithTime(`⚠️ [linkScopeToHlfService] Scope ${scope._id} is already linked to HLF ${hlfId}. No changes made.`);
      return { success: true, message: "Scope is already linked to this feature. No changes made.", scope };
    }

    // ── Update Scope with featureId and set category ───────────────────────────
    scope.featureId = hlf._id;
    scope.category = featureId ? ScopeCategoryTypes.LOCAL : ScopeCategoryTypes.GLOBAL;
    scope.updatedBy = linkedBy;
    const linkedScope = await scope.save();

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId.toString(),
      currentPhase: Phases.INCEPTION,
      action: `Scope "${linkedScope.title}" linked to High-level Feature "${hlf.title}" (category: ${linkedScope.category}) — version bump`,
      performedBy: linkedBy,
      auditContext: auditContext
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldScope, linkedScope);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.LINK_SCOPE_TO_HLF,
      `Scope "${linkedScope.title}" linked to HLF "${hlf.title}" with category ${linkedScope.category} by ${linkedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: linkedScope._id?.toString() },
      }
    );

    logWithTime(`✅ [linkScopeToHlfService] Scope ${linkedScope._id} successfully linked to HLF ${hlf._id}`);
    return { success: true, message: "Scope successfully linked to HLF", scope: linkedScope };

  } catch (error) {
    logWithTime(`❌ [linkScopeToHlfService] Error caught while linking Scope to HLF`);
    errorMessage(error);
    if (error.name === "ValidationError") {
      logWithTime(`[linkScopeToHlfService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Error while linking scope to HLF", error: error.message };
  }
};

module.exports = { linkScopeToHlfService };
