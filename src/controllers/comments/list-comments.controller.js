// controllers/comments/list-comments.controller.js

const { listCommentsService } = require("@services/comments/list-comments.service");
const { sendCommentsListSuccess } = require("@/responses/success/comment.response");
const {
  throwInternalServerError,
  throwBadRequestError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

/**
 * Controller: List Comments (Flat)
 * Lists all comments for an entity without hierarchical structure
 * Accessible by both admin and client stakeholders
 */
const listCommentsController = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    let { page = 1, limit = 20 } = req.query;

    // ── Validate pagination parameters ────────────────────────────────────
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
      logWithTime(`⚠️ [listCommentsController] Invalid page number | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, "Page must be a positive integer");
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      logWithTime(`⚠️ [listCommentsController] Invalid limit | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, "Limit must be between 1 and 100");
    }

    // ── Call service ──────────────────────────────────────
    const result = await listCommentsService({
      entityType,
      entityId,
      page,
      limit,
    });

    if (!result.success) {
      logWithTime(`❌ [listCommentsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listCommentsController] Comments listed successfully | ${getLogIdentifiers(req)}`);
    return sendCommentsListSuccess(res, result.comments, result.total, result.page, result.pages);

  } catch (error) {
    logWithTime(`❌ [listCommentsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listCommentsController };
