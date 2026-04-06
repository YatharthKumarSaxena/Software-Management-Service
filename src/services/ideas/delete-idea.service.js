// services/ideas/delete-idea.service.js

const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, INTERNAL_ERROR, UNAUTHORIZED } = require("@configs/http-status.config");

/**
 * Deletes (soft deletes) an idea.
 * Only allowed if idea status is PENDING.
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 * @param {Object} params
 * @param {string} params.deletedBy - User ID who deleted
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, idea } | { success: false, message, errorCode }}
 */
const deleteIdeaService = async (
  idea,
  { deletedBy, auditContext }
) => {
  try {
    // ── Step 1: Check ownership - only creator can delete ──────────────
    if (idea.createdBy.toString() !== deletedBy.toString()) {
      logWithTime(
        `❌ [deleteIdeaService] User ${deletedBy} is not the creator of idea ${idea._id}. Creator: ${idea.createdBy}`
      );
      return {
        success: false,
        message: "You are not authorized to delete this idea. Only the creator can delete it.",
        errorCode: UNAUTHORIZED
      };
    }

    // ── Step 2: Check if idea is in PENDING status ──────────────────────
    if (idea.status !== IdeaStatuses.PENDING) {
      logWithTime(
        `❌ [deleteIdeaService] Cannot delete idea (status: ${idea.status}). Only PENDING ideas can be deleted.`
      );
      return {
        success: false,
        message: `Cannot delete idea in ${idea.status} status. Only PENDING ideas can be deleted.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Step 3: Soft delete the idea ────────────────────────────────────
    const oldIdeaData = { ...idea.toObject ? idea.toObject() : idea };
    
    const deletedIdea = await IdeaModel.findByIdAndUpdate(
      idea._id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy
        }
      },
      { new: true }
    );

    if (!deletedIdea) {
      logWithTime(`❌ [deleteIdeaService] Failed to delete idea ${idea._id}`);
      return {
        success: false,
        message: "Failed to delete idea",
        errorCode: INTERNAL_ERROR
      };
    }

    // ── Step 4: Log activity tracker event ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldIdeaData, deletedIdea);
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.DELETE_IDEA,
      `Idea deleted`,
      { oldData, newData, adminActions: { targetId: idea._id } }
    );

    logWithTime(`✅ [deleteIdeaService] Idea deleted successfully: ${idea._id}`);
    
    return { success: true, idea: deletedIdea };

  } catch (error) {
    logWithTime(`❌ [deleteIdeaService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while deleting idea", error: error.message };
  }
};

module.exports = { deleteIdeaService };
