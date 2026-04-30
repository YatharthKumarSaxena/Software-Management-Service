// services/requirements/review-notes/update-review-note.service.js

const { ReviewNoteModel } = require("@models/review-note.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR, FORBIDDEN, CONFLICT, BAD_REQUEST } = require("@configs/http-status.config");
const { descriptionLength } = require("@/configs/fields-length.config");
const { manualVersionControlService } = require("../common/version.service");

/**
 * Updates a review note
 * 
 * Permissions:
 * - Only the creator can update their own note
 * - Update allowed only within 30 minutes of creation
 * 
 * Validations:
 * 1. Phase context must not be frozen
 * 2. Review note must exist and not deleted
 * 3. User must be the creator
 * 4. Must be within 30 minutes of creation
 * 5. Description must be valid length
 * 
 * @param {Object} params
 * @param {string} params.reviewNoteId - Review note ID to update
 * @param {string} params.description - New description
 * @param {Object} params.phaseContext - Phase context object with isFrozen status
 * @param {string} params.phase - Phase name (ELICITATION, ELABORATION, NEGOTIATION)
 * @param {string} params.userId - User ID attempting update
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, reviewNote } | { success: false, message, errorCode }}
 */
const updateReviewNoteService = async ({
  reviewNoteId,
  description,
  phaseContext,
  phase,
  userId,
  auditContext
}) => {
  try {
    logWithTime(
      `📍 [updateReviewNoteService] Updating review note: ${reviewNoteId}`
    );

    // ── 1. Validate phaseContext ────────────────────────────────────────────
    if (!phaseContext) {
      logWithTime(`❌ [updateReviewNoteService] Phase context not provided`);
      return {
        success: false,
        message: `Phase context is required`,
        errorCode: CONFLICT
      };
    }

    if (phaseContext.isFrozen) {
      logWithTime(`❌ [updateReviewNoteService] Cannot update review note. ${phase} phase is frozen.`);
      return {
        success: false,
        message: `Cannot update review note. ${phase} phase is frozen.`,
        errorCode: CONFLICT
      };
    }


    // ── 3. Fetch review note ─────────────────────────────────────────────────
    const reviewNote = await ReviewNoteModel.findOne({
      _id: reviewNoteId,
      isDeleted: false
    });

    if (!reviewNote) {
      logWithTime(`❌ [updateReviewNoteService] Review note not found: ${reviewNoteId}`);
      return {
        success: false,
        message: "Review note not found",
        errorCode: NOT_FOUND
      };
    }

    // ── 4. Check if user is the creator ──────────────────────────────────────
    if (reviewNote.createdBy !== userId) {
      logWithTime(`❌ [updateReviewNoteService] Access denied. Only creator can update. Created by: ${reviewNote.createdBy}, Attempting user: ${userId}`);
      return {
        success: false,
        message: "Only the creator can update this review note",
        errorCode: FORBIDDEN
      };
    }

    // ── 5. Check 30-minute time limit ────────────────────────────────────────
    const currentTime = new Date();
    const createdTime = new Date(reviewNote.createdAt);
    const timeDifferenceMinutes = (currentTime - createdTime) / (1000 * 60);
    const TIME_LIMIT_MINUTES = 30;

    if (timeDifferenceMinutes > TIME_LIMIT_MINUTES) {
      logWithTime(`❌ [updateReviewNoteService] Update time limit exceeded. Created: ${createdTime}, Attempted: ${currentTime}`);
      return {
        success: false,
        message: `Review notes can only be updated within ${TIME_LIMIT_MINUTES} minutes of creation`,
        errorCode: CONFLICT
      };
    }

    // ── 6. Store old data for audit ──────────────────────────────────────────
    const oldReviewNote = reviewNote.toObject ? reviewNote.toObject() : { ...reviewNote };

    // ── 7. Update review note ───────────────────────────────────────────────
    reviewNote.description = description.trim();
    reviewNote.updatedAt = new Date();
    reviewNote.updatedBy = userId;

    const updatedReviewNote = await reviewNote.save();

    logWithTime(`✅ [updateReviewNoteService] Review note updated successfully`);

    // ── 8. Log activity tracker event ───────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REVIEW_NOTE_UPDATED,
      `Review note updated in ${phase} phase`,
      {
        oldData: oldReviewNote,
        newData: updatedReviewNote,
        adminActions: { targetId: reviewNoteId }
      }
    );

    // ── 9. Call version control service ───────────────────────────────────────
    await manualVersionControlService({
      projectId: reviewNote.projectId,
      currentPhase: phase,
      action: `Review note updated`,
      performedBy: userId,
      auditContext
    });

    return { success: true, reviewNote: updatedReviewNote };

  } catch (error) {
    logWithTime(`❌ [updateReviewNoteService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error updating review note",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { updateReviewNoteService };
