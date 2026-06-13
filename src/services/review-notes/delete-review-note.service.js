// services/requirements/review-notes/delete-review-note.service.js

const { ReviewNoteModel } = require("@models/review-note.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR, BAD_REQUEST, CONFLICT, NOT_FOUND, FORBIDDEN } = require("@configs/http-status.config");
const { ReviewNoteDeletionReasons } = require("@/configs/reasons.config");
const { manualVersionControlService } = require("../common/version.service");
const { isPhaseFrozen } = require("@utils/phase-status.util");

/**
 * Soft-deletes a review note
 * 
 * Permissions & Time Constraints:
 * - Creator: Can delete own note within 30 minutes of creation
 * - Other reviewers: Can delete anytime
 * 
 * Validations:
 * 1. Phase context must not be frozen
 * 2. Review note must exist and not already deleted
 * 3. If creator, enforce 30-minute deletion window
 * 4. Optional deletion description (max length)
 * 
 * @param {Object} params
 * @param {string} params.reviewNoteId - Review note ID to delete
 * @param {Object} params.phaseContext - Phase context object with isFrozen status
 * @param {string} params.phase - Phase name (ELICITATION, ELABORATION, NEGOTIATION)
 * @param {string} params.userId - User ID attempting deletion
 * @param {string} [params.deletionDescription] - Optional deletion description
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, reviewNote } | { success: false, message, errorCode }}
 */
const deleteReviewNoteService = async ({
  reviewNoteId,
  phaseContext,
  phase,
  userId,
  deletionDescription,
  auditContext
}) => {
  try {
    logWithTime(
      `📍 [deleteReviewNoteService] Deleting review note: ${reviewNoteId}`
    );

    // ── 1. Validate phaseContext ────────────────────────────────────────────
    if (!phaseContext) {
      logWithTime(`❌ [deleteReviewNoteService] Phase context not provided`);
      return {
        success: false,
        message: `Phase context is required`,
        errorCode: CONFLICT
      };
    }

    if (isPhaseFrozen(phaseContext)) {
      logWithTime(`❌ [deleteReviewNoteService] Cannot delete review note. ${phase} phase is frozen.`);
      return {
        success: false,
        message: `Cannot delete review note. ${phase} phase is frozen.`,
        errorCode: CONFLICT
      };
    }

    // ── 2. Fetch review note ─────────────────────────────────────────────────
    const reviewNote = await ReviewNoteModel.findOne({
      _id: reviewNoteId,
      isDeleted: false
    });

    if (!reviewNote) {
      logWithTime(`❌ [deleteReviewNoteService] Review note not found: ${reviewNoteId}`);
      return {
        success: false,
        message: "Review note not found",
        errorCode: NOT_FOUND
      };
    }

    // ── 3. Check creator status and enforce time constraint ──────────────────
    const isCreator = reviewNote.createdBy === userId;

    // If creator, enforce 30-minute deletion window
    if (isCreator) {
      const creationTime = new Date(reviewNote.createdAt);
      const currentTime = new Date();
      const timeDifferenceMinutes = (currentTime - creationTime) / (1000 * 60);

      if (timeDifferenceMinutes > 30) {
        logWithTime(`❌ [deleteReviewNoteService] Creator's 30-minute deletion window expired. Created: ${creationTime}, Now: ${currentTime}, Difference: ${Math.round(timeDifferenceMinutes)} minutes`);
        return {
          success: false,
          message: "30-minute deletion window for creators has expired",
          errorCode: CONFLICT
        };
      }
    }

    // Other reviewers can delete anytime (admin already accessing service has authority)
    if (deletionDescription) {
      const descLength = deletionDescription.trim().length;
      if (descLength > 500) {
        logWithTime(`❌ [deleteReviewNoteService] Deletion description too long: ${descLength}`);
        return {
          success: false,
          message: `Deletion description must not exceed 500 characters`,
          errorCode: BAD_REQUEST
        };
      }
    }

    // ── 5. Store old data for audit ──────────────────────────────────────────
    const oldReviewNote = reviewNote.toObject ? reviewNote.toObject() : { ...reviewNote };

    // ── 6. Soft-delete review note ───────────────────────────────────────────
    reviewNote.isDeleted = true;
    reviewNote.deletedAt = new Date();
    reviewNote.deletedBy = userId;

    const updatedReviewNote = await reviewNote.save();

    logWithTime(`✅ [deleteReviewNoteService] Review note soft-deleted successfully`);

    // ── 7. Log activity tracker event ───────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REVIEW_NOTE_DELETED,
      `Review note deleted in ${phase} phase`,
      {
        oldData: oldReviewNote,
        newData: updatedReviewNote,
        deletedBy: userId
      }
    );

    // ── 8. Call version control service ───────────────────────────────────────
    await manualVersionControlService({
      projectId: reviewNote.projectId,
      currentPhase: phase,
      action: `Review note deleted`,
      performedBy: userId,
      auditContext
    });

    return { success: true, reviewNote: updatedReviewNote };

  } catch (error) {
    logWithTime(`❌ [deleteReviewNoteService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error deleting review note",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { deleteReviewNoteService };
