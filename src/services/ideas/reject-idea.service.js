// services/ideas/reject-idea.service.js

const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");

/**
 * Rejects an idea (changes status from PENDING to REJECTED).
 * Requires rejectedReasonType and notAcceptedReasonDescription.
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 * @param {Object} params
 * @param {string} params.rejectedReasonType - Enum value for rejection reason
 * @param {string} params.notAcceptedReasonDescription - Description of rejection
 * @param {string} params.decidedBy - User ID who rejected
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, idea } | { success: false, message, errorCode }}
 */
const rejectIdeaService = async (
  idea,
  { rejectedReasonType, notAcceptedReasonDescription, decidedBy, auditContext }
) => {
  try {
    // ── Step 1: Check if idea is in PENDING status ──────────────────────
    if (idea.status !== IdeaStatuses.PENDING) {
      logWithTime(
        `❌ [rejectIdeaService] Cannot reject idea (status: ${idea.status}). Only PENDING ideas can be rejected.`
      );
      return {
        success: false,
        message: `Cannot reject idea in ${idea.status} status. Only PENDING ideas can be rejected.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Step 2: Update idea status to REJECTED ──────────────────────────
    const oldIdeaData = { ...idea.toObject ? idea.toObject() : idea };
    
    const updatedIdea = await IdeaModel.findByIdAndUpdate(
      idea._id,
      {
        $set: {
          status: IdeaStatuses.REJECTED,
          rejectedReasonType,
          notAcceptedReasonDescription,
          decidedBy,
          decidedAt: new Date(),
          updatedBy: decidedBy
        }
      },
      { new: true }
    );

    if (!updatedIdea) {
      logWithTime(`❌ [rejectIdeaService] Failed to reject idea ${idea._id}`);
      return {
        success: false,
        message: "Failed to reject idea",
        errorCode: CONFLICT
      };
    }

    // ── Step 3: Log activity tracker event ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldIdeaData, updatedIdea);
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.REJECT_IDEA,
      `Idea rejected with reason: ${rejectedReasonType}`,
      { oldData, newData, adminActions: { targetId: idea._id } }
    );

    logWithTime(`✅ [rejectIdeaService] Idea rejected successfully: ${idea._id}`);
    
    return { success: true, idea: updatedIdea };

  } catch (error) {
    logWithTime(`❌ [rejectIdeaService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while rejecting idea", error: error.message };
  }
};

module.exports = { rejectIdeaService };
