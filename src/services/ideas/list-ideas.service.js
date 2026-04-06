// services/ideas/list-ideas.service.js

const { IdeaModel } = require("@models/idea.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND } = require("@configs/http-status.config");

/**
 * Lists all ideas for a project with pagination.
 *
 * @param {Object} params
 * @param {string} params.projectId - Project MongoDB ObjectId
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10, max: 100)
 *
 * @returns {{ success: true, ideas, total, page, totalPages } | { success: false, message, errorCode }}
 */
const listIdeasService = async ({
  projectId,
  page = 1,
  limit = 10
}) => {
  try {
    // ── Validate and normalize pagination parameters ──────────────────────
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNumber - 1) * pageLimit;

    // ── Fetch total count ────────────────────────────────────────────────
    const total = await IdeaModel.countDocuments({
      projectId,
      isDeleted: false
    });

    // ── Fetch paginated ideas ────────────────────────────────────────────
    const ideas = await IdeaModel.find({
      projectId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    const totalPages = Math.ceil(total / pageLimit);

    logWithTime(`✅ [listIdeasService] Retrieved ${ideas.length} ideas for project ${projectId} (page ${pageNumber}/${totalPages})`);

    return {
      success: true,
      ideas,
      pagination: {
        total,
        page: pageNumber,
        limit: pageLimit,
        totalPages
      }
    };

  } catch (error) {
    logWithTime(`❌ [listIdeasService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while listing ideas", error: error.message };
  }
};

module.exports = { listIdeasService };
