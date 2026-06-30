// services/constraints/link-constraint-to-hlf.service.js

const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases, ApplicabilityTypes } = require("@/configs/enums.config");
const { FORBIDDEN } = require("@/configs/http-status.config");

/**
 * Links a constraint to a high-level feature.
 * Category is automatically set to LOCAL when linking (no user input needed).
 * If already linked to the same feature, returns success without tracking activity.
 *
 * @param {Object} params
 * @param {Object} params.constraint - The Constraint document to link
 * @param {Object} params.hlf - The HLF document to link to
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {string} params.linkedBy - USR-prefixed custom ID of the admin linking
 * @param {Object} params.auditContext - { user, device, requestId }
 * @returns {{ success: boolean, constraint?: Object, message?: string, error?: string }}
 */
const linkConstraintToHlfService = async ({
  constraint,
  hlf,
  inception,
  linkedBy,
  auditContext,
}) => {
  try {
    // ── Store old constraint for comparison ────────────────────────────────────
    const oldConstraint = constraint.toObject ? constraint.toObject() : { ...constraint };

    const hlfId = hlf._id.toString();
    const constraintCurrentFeatureId = constraint.featureId?.toString();

    // ── Cross-project guard ────────────────────────────────────────────────────
    if (constraint.projectId.toString() !== hlf.projectId.toString()) {
      logWithTime(`❌ [linkConstraintToHlfService] Constraint ${constraint._id} and HLF ${hlf._id} belong to different projects.`);
      return {
        success: false,
        message: "Constraint and HLF belong to different projects.",
        errorCode: FORBIDDEN
      };
    }

    // ── Already linked to same feature — no-op ─────────────────────────────────
    if (constraintCurrentFeatureId === hlfId) {
      logWithTime(`⚠️ [linkConstraintToHlfService] Constraint ${constraint._id} is already linked to HLF ${hlfId}. No changes made.`);
      return {
        success: true,
        message: "Constraint is already linked to this feature. No changes made.",
        constraint
      };
    }

    // ── Link: set featureId and automatically set category to LOCAL ────────────
    constraint.featureId = hlf._id;
    constraint.category = ApplicabilityTypes.LOCAL;  // automatically set — user does not control this
    constraint.updatedBy = linkedBy;
    const linkedConstraint = await constraint.save();

    // ── Version control ────────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId.toString(),
      currentPhase: Phases.INCEPTION,
      action: `Constraint "${linkedConstraint.title}" linked to HLF "${hlf.title}" (category: LOCAL) — version bump`,
      performedBy: linkedBy,
      auditContext
    });

    // ── Activity tracker ───────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldConstraint, linkedConstraint);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.LINK_CONSTRAINT_TO_HLF,
      `Constraint "${linkedConstraint.title}" linked to HLF "${hlf.title}" (category set to LOCAL) by ${linkedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: linkedConstraint._id?.toString() },
      }
    );

    logWithTime(`✅ [linkConstraintToHlfService] Constraint ${linkedConstraint._id} successfully linked to HLF ${hlf._id}`);
    return { success: true, message: "Constraint successfully linked to HLF", constraint: linkedConstraint };

  } catch (error) {
    logWithTime(`❌ [linkConstraintToHlfService] Error caught while linking Constraint to HLF`);
    errorMessage(error);
    if (error.name === "ValidationError") {
      logWithTime(`[linkConstraintToHlfService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Error while linking constraint to HLF", error: error.message };
  }
};

module.exports = { linkConstraintToHlfService };
