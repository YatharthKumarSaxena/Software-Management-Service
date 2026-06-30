// services/constraints/unlink-constraint-to-hlf.service.js

const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { ApplicabilityTypes, Phases } = require("@/configs/enums.config");

/**
 * Unlinks a constraint from a high-level feature.
 * Sets featureId to null and automatically sets category to GLOBAL.
 * If already unlinked (no featureId), returns success without tracking activity.
 *
 * @param {Object} params
 * @param {Object} params.constraint - The Constraint document to unlink
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {string} params.unlinkedBy - USR-prefixed custom ID of the admin unlinking
 * @param {Object} params.auditContext - { user, device, requestId }
 * @returns {{ success: boolean, constraint?: Object, message?: string, error?: string }}
 */
const unlinkConstraintToHlfService = async ({
  constraint,
  inception,
  unlinkedBy,
  auditContext,
}) => {
  try {
    // ── Store old constraint for comparison ────────────────────────────────────
    const oldConstraint = constraint.toObject ? constraint.toObject() : { ...constraint };

    // ── Already unlinked — no-op ───────────────────────────────────────────────
    if (!constraint.featureId) {
      logWithTime(
        `⚠️ [unlinkConstraintToHlfService] Constraint ${constraint._id} is not linked to any feature. No changes made.`
      );
      return {
        success: true,
        message: "Constraint is not linked to any feature. No changes made.",
        constraint,
      };
    }

    // ── Unlink: remove featureId and automatically set category to GLOBAL ──────
    constraint.featureId = null;
    constraint.category = ApplicabilityTypes.GLOBAL;  // automatically set — user does not control this
    constraint.updatedBy = unlinkedBy;
    const unlinkedConstraint = await constraint.save();

    // ── Version control ────────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId.toString(),
      currentPhase: Phases.INCEPTION,
      action: `Constraint "${unlinkedConstraint.title}" unlinked from HLF (reverted to GLOBAL category) — version bump`,
      performedBy: unlinkedBy,
      auditContext,
    });

    // ── Activity tracker ───────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldConstraint, unlinkedConstraint);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UNLINK_CONSTRAINT_TO_HLF,
      `Constraint "${unlinkedConstraint.title}" unlinked from HLF (category reset to GLOBAL) by ${unlinkedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: unlinkedConstraint._id?.toString() },
      }
    );

    logWithTime(
      `✅ [unlinkConstraintToHlfService] Constraint ${unlinkedConstraint._id} successfully unlinked from HLF`
    );
    return { success: true, message: "Constraint successfully unlinked from HLF", constraint: unlinkedConstraint };

  } catch (error) {
    logWithTime(
      `❌ [unlinkConstraintToHlfService] Error caught while unlinking Constraint from HLF`
    );
    errorMessage(error);
    if (error.name === "ValidationError") {
      logWithTime(
        `[unlinkConstraintToHlfService] Validation Error Details: ${JSON.stringify(error.errors)}`
      );
      return { success: false, message: "Validation error", error: error.message };
    }
    return {
      success: false,
      message: "Error while unlinking constraint from HLF",
      error: error.message,
    };
  }
};

module.exports = { unlinkConstraintToHlfService };
