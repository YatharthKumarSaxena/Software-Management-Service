// services/high-level-features/unlink-hlf-to-idea.service.js

const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases } = require("@/configs/enums.config");

/**
 * Unlinks a high-level feature from an idea.
 * Sets ideaId to null.
 * If already unlinked (no ideaId), returns success without tracking activity.
 * 
 * @param {Object} params
 * @param {Object} params.hlf - The HLF document to unlink
 * @param {Object} params.project - The Project document (for version control)
 * @param {string} params.unlinkedBy - USR-prefixed custom ID of the admin unlinking
 * @param {Object} params.auditContext - { user, device, requestId }
 * @returns {{ success: boolean, hlf?: Object, message?: string, error?: string }}
 */
const unlinkHlfFromIdeaService = async ({
  hlf,
  project,
  unlinkedBy,
  auditContext,
}) => {
  try {
    // ── Store old HLF for comparison ────────────────────────────────────────
    const oldHlf = hlf.toObject ? hlf.toObject() : { ...hlf };

    // ── Check if already unlinked ────────────────────────────────────────────
    if (!hlf.ideaId) {
      logWithTime(
        `⚠️ [unlinkHlfFromIdeaService] HLF ${hlf._id} is not linked to any idea. No changes made.`
      );
      return {
        success: true,
        message: "HLF is not linked to any idea. No changes made.",
        hlf,
      };
    }

    // ── Update HLF: remove ideaId ──────────────────────────────────────────────
    hlf.ideaId = null;
    hlf.updatedBy = unlinkedBy;
    const unlinkedHlf = await hlf.save();

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: project._id.toString(),
      currentPhase: Phases.INCEPTION,
      action: `High-level feature "${unlinkedHlf.title}" unlinked from Idea — version bump`,
      performedBy: unlinkedBy,
      auditContext: auditContext,
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldHlf, unlinkedHlf);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UNLINK_HLF_FROM_IDEA,
      `High-level feature "${unlinkedHlf.title}" unlinked from Idea by ${unlinkedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: unlinkedHlf._id?.toString() },
      }
    );

    logWithTime(
      `✅ [unlinkHlfFromIdeaService] HLF ${unlinkedHlf._id} successfully unlinked from Idea`
    );
    return { success: true, message: "HLF successfully unlinked from Idea", hlf: unlinkedHlf };
  } catch (error) {
    logWithTime(
      `❌ [unlinkHlfFromIdeaService] Error caught while unlinking HLF from Idea`
    );
    errorMessage(error);
    if (error.name === "ValidationError") {
      logWithTime(
        `[unlinkHlfFromIdeaService] Validation Error Details: ${JSON.stringify(error.errors)}`
      );
      return { success: false, message: "Validation error", error: error.message };
    }
    return {
      success: false,
      message: "Error while unlinking HLF from Idea",
      error: error.message,
    };
  }
};

module.exports = { unlinkHlfFromIdeaService };
