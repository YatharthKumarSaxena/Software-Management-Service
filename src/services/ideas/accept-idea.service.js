// services/ideas/accept-idea.service.js

const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");

/**
 * Accepts an idea (changes status from PENDING to ACCEPTED).
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 * @param {Object} params
 * @param {string} params.decidedBy - User ID who accepted
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, idea } | { success: false, message, errorCode }}
 */
const acceptIdeaService = async (
  idea,
  { decidedBy, auditContext }
) => {
  try {
    // ── Step 1: Check if idea is in PENDING status ──────────────────────
    if (idea.status !== IdeaStatuses.PENDING) {
      logWithTime(
        `❌ [acceptIdeaService] Cannot accept idea (status: ${idea.status}). Only PENDING ideas can be accepted.`
      );
      return {
        success: false,
        message: `Cannot accept idea in ${idea.status} status. Only PENDING ideas can be accepted.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Step 2: Update idea status to ACCEPTED ──────────────────────────
    const oldIdeaData = { ...idea.toObject ? idea.toObject() : idea };
    
    const updatedIdea = await IdeaModel.findByIdAndUpdate(
      idea._id,
      {
        $set: {
          status: IdeaStatuses.ACCEPTED,
          decidedBy,
          decidedAt: new Date(),
          updatedBy: decidedBy
        }
      },
      { new: true }
    );

    if (!updatedIdea) {
      logWithTime(`❌ [acceptIdeaService] Failed to accept idea ${idea._id}`);
      return {
        success: false,
        message: "Failed to accept idea",
        errorCode: CONFLICT
      };
    }

    // ── Step 3: Log activity tracker event ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldIdeaData, updatedIdea);
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.ACCEPT_IDEA,
      `Idea accepted`,
      { oldData, newData, adminActions: { targetId: idea._id } }
    );

    logWithTime(`✅ [acceptIdeaService] Idea accepted successfully: ${idea._id}`);
    
    return { success: true, idea: updatedIdea };

  } catch (error) {
    logWithTime(`❌ [acceptIdeaService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while accepting idea", error: error.message };
  }
};

module.exports = { acceptIdeaService };
