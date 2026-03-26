// services/elicitations/list-elicitations.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Lists all non-deleted elicitations for a project with pagination.
 *
 * @param {Object} params
 * @param {string} params.projectId - Project ID
 * @param {number} [params.page] - Page number (default: 1)
 * @param {number} [params.limit] - Items per page (default: 20)
 * @param {string} [params.sort] - Sort order (default: -createdAt)
 *
 * @returns {Object} { errorCode, success: true, data, pagination } | { errorCode, success: false, message }
 */
const listElicitationsService = async ({
  projectId,
  page = 1,
  limit = 20,
  sort = "-createdAt"
}) => {
  try {

    // ── Parse pagination params ──────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20)); // Cap at 100
    const skip = (pageNum - 1) * pageSize;

    // ── Query all non-deleted elicitations for project ────────────────
    const totalCount = await ElicitationModel.countDocuments({
      projectId,
      isDeleted: false
    });

    const elicitations = await ElicitationModel.find({
      projectId,
      isDeleted: false
    })
      .populate('projectId', 'name description')
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    // ── Build pagination metadata ────────────────────────────────────
    const totalPages = Math.ceil(totalCount / pageSize);

    logWithTime(`✅ [listElicitationsService] Retrieved ${elicitations.length} elicitations from project ${projectId}`);
    return {
      errorCode: OK,
      success: true,
      data: { elicitations },
      pagination: {
        page: pageNum,
        limit: pageSize,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    };

  } catch (error) {
    logWithTime(`❌ [listElicitationsService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Validation error: " + error.message
      };
    }
    return {
      errorCode: INTERNAL_ERROR,
      success: false,
      message: "Internal error while retrieving elicitations"
    };
  }
};

module.exports = { listElicitationsService };
