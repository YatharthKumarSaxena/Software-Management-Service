// services/ideas/reopen-idea.service.js

const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");

/**
 * Reopens an idea (changes status from REJECTED/DEFERRED back to PENDING).
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 * @param {Object} params
 * @param {string} params.reopenedBy - User ID who reopened
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, idea } | { success: false, message, errorCode }}
 */
const reopenIdeaService = async (
  idea,
  { reopenedBy, auditContext }
) => {
  try {
    // ── Step 1: Check if idea is in REJECTED or DEFERRED status ────────
    if (idea.status !== IdeaStatuses.REJECTED && idea.status !== IdeaStatuses.DEFERRED) {
      logWithTime(
        `❌ [reopenIdeaService] Cannot reopen idea (status: ${idea.status}). Only REJECTED/DEFERRED ideas can be reopened.`
      );
      return {
        success: false,
        message: `Cannot reopen idea in ${idea.status} status. Only REJECTED/DEFERRED ideas can be reopened.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Step 2: Update idea status to PENDING ────────────────────────────
    const oldIdeaData = { ...idea.toObject ? idea.toObject() : idea };
    
    const updatedIdea = await IdeaModel.findByIdAndUpdate(
      idea._id,
      {
        $set: {
          status: IdeaStatuses.PENDING,
          rejectedReasonType: null,
          deferredReasonType: null,
          notAcceptedReasonDescription: null,
          decidedBy: null,
          decidedAt: null,
          updatedBy: reopenedBy
        }
      },
      { new: true }
    );

    if (!updatedIdea) {
      logWithTime(`❌ [reopenIdeaService] Failed to reopen idea ${idea._id}`);
      return {
        success: false,
        message: "Failed to reopen idea",
        errorCode: CONFLICT
      };
    }

    // ── Step 3: Log activity tracker event ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldIdeaData, updatedIdea);
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.REOPEN_IDEA,
      `Idea reopened from ${idea.status} status`,
      { oldData, newData, adminActions: { targetId: idea._id } }
    );

    logWithTime(`✅ [reopenIdeaService] Idea reopened successfully: ${idea._id}`);
    
    return { success: true, idea: updatedIdea };

  } catch (error) {
    logWithTime(`❌ [reopenIdeaService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while reopening idea", error: error.message };
  }
};

module.exports = { reopenIdeaService };
