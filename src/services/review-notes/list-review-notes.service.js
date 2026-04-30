// services/requirements/review-notes/list-review-notes.service.js

const { ReviewNoteModel } = require("@models/review-note.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Lists all review notes for a specific entity (by entityId)
 * Filters out deleted notes
 * Returns all review notes associated with the entity
 * 
 * @param {Object} params
 * @param {string} params.entityId - Entity ID to fetch review notes for
 * @param {number} [params.limit] - Limit number of results (default: no limit)
 * @param {number} [params.skip] - Skip number of results for pagination (default: 0)
 * @param {string} [params.sortBy] - Sort field (default: "createdAt")
 * @param {number} [params.sortOrder] - Sort order 1 (asc) or -1 (desc) (default: -1)
 * 
 * @returns {{ success: true, reviewNotes: [], total: number } | { success: false, message, errorCode }}
 */
const listReviewNotesService = async ({
  entityId,
  limit = null,
  skip = 0,
  sortBy = "createdAt",
  sortOrder = -1
}) => {
  try {
    logWithTime(
      `📍 [listReviewNotesService] Listing review notes for entity: ${entityId}`
    );

    // ── 1. Build query filter ─────────────────────────────────────────────────
    const query = {
      entityId: entityId,
      isDeleted: false
    };

    // ── 2. Build sort object ──────────────────────────────────────────────────
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    // ── 3. Fetch review notes ─────────────────────────────────────────────────
    let queryBuilder = ReviewNoteModel.find(query).sort(sortObj);

    if (skip > 0) {
      queryBuilder = queryBuilder.skip(skip);
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const reviewNotes = await queryBuilder.exec();

    // ── 4. Get total count ────────────────────────────────────────────────────
    const total = await ReviewNoteModel.countDocuments(query);

    logWithTime(
      `✅ [listReviewNotesService] Retrieved ${reviewNotes.length} of ${total} review note(s)`
    );

    return {
      success: true,
      reviewNotes,
      total
    };

  } catch (error) {
    logWithTime(`❌ [listReviewNotesService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error retrieving review notes",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { listReviewNotesService };
