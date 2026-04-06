// services/ideas/defer-idea.service.js

const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");

/**
 * Defers an idea (changes status from PENDING to DEFERRED).
 * Requires deferredReasonType and notAcceptedReasonDescription.
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 * @param {Object} params
 * @param {string} params.deferredReasonType - Enum value for deferral reason
 * @param {string} params.notAcceptedReasonDescription - Description of deferral
 * @param {string} params.decidedBy - User ID who deferred
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, idea } | { success: false, message, errorCode }}
 */
const deferIdeaService = async (
  idea,
  { deferredReasonType, notAcceptedReasonDescription, decidedBy, auditContext }
) => {
  try {
    // ── Step 1: Check if idea is in PENDING status ──────────────────────
    if (idea.status !== IdeaStatuses.PENDING) {
      logWithTime(
        `❌ [deferIdeaService] Cannot defer idea (status: ${idea.status}). Only PENDING ideas can be deferred.`
      );
      return {
        success: false,
        message: `Cannot defer idea in ${idea.status} status. Only PENDING ideas can be deferred.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Step 2: Update idea status to DEFERRED ──────────────────────────
    const oldIdeaData = { ...idea.toObject ? idea.toObject() : idea };
    
    const updatedIdea = await IdeaModel.findByIdAndUpdate(
      idea._id,
      {
        $set: {
          status: IdeaStatuses.DEFERRED,
          deferredReasonType,
          notAcceptedReasonDescription,
          decidedBy,
          decidedAt: new Date(),
          updatedBy: decidedBy
        }
      },
      { new: true }
    );

    if (!updatedIdea) {
      logWithTime(`❌ [deferIdeaService] Failed to defer idea ${idea._id}`);
      return {
        success: false,
        message: "Failed to defer idea",
        errorCode: CONFLICT
      };
    }

    // ── Step 3: Log activity tracker event ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldIdeaData, updatedIdea);
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.DEFER_IDEA,
      `Idea deferred with reason: ${deferredReasonType}`,
      { oldData, newData, adminActions: { targetId: idea._id } }
    );

    logWithTime(`✅ [deferIdeaService] Idea deferred successfully: ${idea._id}`);
    
    return { success: true, idea: updatedIdea };

  } catch (error) {
    logWithTime(`❌ [deferIdeaService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while deferring idea", error: error.message };
  }
};

module.exports = { deferIdeaService };
