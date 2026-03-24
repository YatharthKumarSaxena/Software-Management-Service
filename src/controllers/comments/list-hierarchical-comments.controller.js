// controllers/comments/list-hierarchical-comments.controller.js

const { listHierarchicalCommentsService } = require("@services/comments/list-hierarchical-comments.service");
const { sendHierarchicalCommentsListSuccess } = require("@/responses/success/comment.response");
const {
  throwInternalServerError,
  throwBadRequestError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

/**
 * Controller: List Comments (Hierarchical)
 * Lists comments with their threaded replies in hierarchical structure
 * Only pagination applies to root comments, all replies are fetched
 * Accessible by both admin and client stakeholders
 */
const listHierarchicalCommentsController = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    // ── Validate pagination parameters ────────────────────────────────────
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
      logWithTime(`⚠️ [listHierarchicalCommentsController] Invalid page number | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, "Page must be a positive integer");
    }

    if (isNaN(limit) || limit < 1 || limit > 50) {
      logWithTime(`⚠️ [listHierarchicalCommentsController] Invalid limit | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, "Limit must be between 1 and 50");
    }

    // ── Call service ──────────────────────────────────────
    const result = await listHierarchicalCommentsService({
      entityType,
      entityId,
      page,
      limit,
    });

    if (!result.success) {
      logWithTime(`❌ [listHierarchicalCommentsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listHierarchicalCommentsController] Hierarchical comments listed successfully | ${getLogIdentifiers(req)}`);
    return sendHierarchicalCommentsListSuccess(res, result.comments, result.total, result.page, result.pages);

  } catch (error) {
    logWithTime(`❌ [listHierarchicalCommentsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listHierarchicalCommentsController };
