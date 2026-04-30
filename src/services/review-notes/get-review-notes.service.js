// services/requirements/review-notes/get-review-notes.service.js

const { ReviewNoteModel } = require("@models/review-note.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Retrieves a specific review note and returns only its ID
 * 
 * @param {Object} params
 * @param {string} params.reviewNoteId - Review note ID to fetch
 * 
 * @returns {{ success: true, reviewNoteId: string } | { success: false, message, errorCode }}
 */
const getReviewNotesService = async ({
  reviewNoteId
}) => {
  try {
    logWithTime(
      `📍 [getReviewNotesService] Fetching review note ID: ${reviewNoteId}`
    );

    // ── 1. Fetch review note ─────────────────────────────────────────────────
    const reviewNote = await ReviewNoteModel.findOne({ 
      _id: reviewNoteId, 
      isDeleted: false 
    });

    if (!reviewNote) {
      logWithTime(`❌ [getReviewNotesService] Review note not found: ${reviewNoteId}`);
      return {
        success: false,
        message: "Review note not found",
        errorCode: NOT_FOUND
      };
    }

    logWithTime(`✅ [getReviewNotesService] Retrieved review note: ${reviewNoteId}`);

    // ── 3. Return only review note ID ────────────────────────────────────────
    return { success: true, reviewNoteId: String(reviewNote._id) };

  } catch (error) {
    logWithTime(`❌ [getReviewNotesService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error retrieving review note",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { getReviewNotesService };
