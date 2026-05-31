// services/high-level-features/link-hlf-to-idea.service.js

const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases, IdeaStatuses } = require("@/configs/enums.config");
const { FORBIDDEN } = require("@/configs/http-status.config");

/**
 * Links a high-level feature to an idea.
 * If already linked to the same idea, returns success without tracking activity.
 * 
 * @param {Object} params
 * @param {Object} params.hlf - The HLF document to link
 * @param {Object} params.idea - The Idea document to link to
 * @param {Object} params.project - The Project document (for version control)
 * @param {string} params.linkedBy - USR-prefixed custom ID of the admin linking
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, hlf?: Object, message?: string, error?: string }}
 */
const linkHlfToIdeaService = async ({
  hlf,
  idea,
  project,
  linkedBy,
  auditContext,
}) => {
  try {
    // ── Store old HLF for comparison ────────────────────────────────────────
    const oldHlf = hlf.toObject ? hlf.toObject() : { ...hlf };
    
    const ideaId = idea._id.toString();
    const hlfCurrentIdeaId = hlf.ideaId?.toString();

    if(hlf.projectId.toString() !== idea.projectId.toString()) {
      logWithTime(`❌ [linkHlfToIdeaService] HLF ${hlf._id} and Idea ${idea._id} belong to different projects. Cannot link.`);
      return { success: false, message: "HLF and Idea belong to different projects.", errorCode: FORBIDDEN };
    }

    if(idea.status !== IdeaStatuses.ACCEPTED) {
      logWithTime(`❌ [linkHlfToIdeaService] Idea ${idea._id} is not in ACCEPTED status. Current status: ${idea.status}. Cannot link.`);
      return { success: false, message: "Only ideas in ACCEPTED status can be linked to high-level features.", errorCode: FORBIDDEN };
    }

    // ── Check if already linked to same idea ─────────────────────────────────
    if (hlfCurrentIdeaId === ideaId) {
      logWithTime(`⚠️ [linkHlfToIdeaService] HLF ${hlf._id} is already linked to Idea ${ideaId}. No changes made.`);
      return { success: true, message: "HLF is already linked to this idea. No changes made.", hlf };
    }


    // ── Update HLF with ideaId ────────────────────────────────────────────────
    hlf.ideaId = idea._id;
    hlf.updatedBy = linkedBy;
    const linkedHlf = await hlf.save();

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: project._id.toString(),
      currentPhase: Phases.INCEPTION,
      action: `High-level feature "${linkedHlf.title}" linked to Idea "${idea.title}" — version bump`,
      performedBy: linkedBy,
      auditContext: auditContext
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldHlf, linkedHlf);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.LINK_HLF_TO_IDEA,
      `High-level feature "${linkedHlf.title}" linked to Idea "${idea.title}" by ${linkedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: linkedHlf._id?.toString() },
      }
    );

    logWithTime(`✅ [linkHlfToIdeaService] HLF ${linkedHlf._id} successfully linked to Idea ${idea._id}`);
    return { success: true, message: "High-level feature linked to idea successfully.", hlf: linkedHlf };

  } catch (error) {
    logWithTime(`❌ [linkHlfToIdeaService] Error caught while linking HLF to Idea`);
    errorMessage(error);
    if (error.name === "ValidationError") {
      logWithTime(`[linkHlfToIdeaService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[linkHlfToIdeaService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while linking HLF to Idea", error: error.message };
  }
};

module.exports = { linkHlfToIdeaService };
