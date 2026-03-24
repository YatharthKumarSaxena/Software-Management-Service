// controllers/comments/get-comment.controller.js

const { getCommentService } = require("@services/comments/get-comment.service");
const { sendCommentFetchedSuccess } = require("@/responses/success/comment.response");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

/**
 * Controller: Get Single Comment
 * Accessible by both admin and client stakeholders
 */
const getCommentController = async (req, res) => {
  try {
    const comment = req.comment;

    // ── Call service ──────────────────────────────────────
    const result = await getCommentService({
      comment,
    });

    if (!result.success) {
      logWithTime(`❌ [getCommentController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getCommentController] Comment fetched successfully | ${getLogIdentifiers(req)}`);
    return sendCommentFetchedSuccess(res, result.comment, result.replies);

  } catch (error) {
    logWithTime(`❌ [getCommentController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getCommentController };
