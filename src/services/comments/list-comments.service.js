// services/comments/list-comments.service.js

const { CommentModel } = require("@models/comment.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

/**
 * Fetch comments for an entity with pagination.
 * Returns only non-deleted comments, sorted by newest first.
 * 
 * @param {Object} params
 * @param {string} params.entityType - Type of entity (requirement, scope, etc)
 * @param {string} params.entityId - ID of entity
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=20] - Results per page
 * @returns {{ success: boolean, comments?: Array, total?: number, page?: number, pages?: number, message?: string, error?: string }}
 */
const listCommentsService = async ({
  entityType,
  entityId,
  page = 1,
  limit = 20,
}) => {
  try {
    const skip = (page - 1) * limit;

    // ── Build query filter ──────────────────────────────────────────────
    const query = {
      entityType,
      isDeleted: false,
    };

    // ── Only add entityId filter if it's not "all" ───────────────────────
    if (entityId !== "all") {
      query.entityId = entityId;
    }

    // ── Get total count ─────────────────────────────────────────────────
    const total = await CommentModel.countDocuments(query);

    // ── Fetch comments ──────────────────────────────────────────────────
    const comments = await CommentModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-isDeleted -deletedAt -deletedBy -deletedReason");

    const pages = Math.ceil(total / limit);

    return {
      success: true,
      comments,
      total,
      page,
      pages,
    };

  } catch (error) {
    logWithTime(`❌ [listCommentsService] Error caught while listing comments`);
    errorMessage(error);
    return { success: false, message: "Internal error while fetching comments", error: error.message };
  }
};

module.exports = { listCommentsService };
