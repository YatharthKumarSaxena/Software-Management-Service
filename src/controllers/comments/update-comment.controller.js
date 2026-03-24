// controllers/comments/update-comment.controller.js

const { updateCommentService } = require("@services/comments/update-comment.service");
const { sendCommentUpdatedSuccess } = require("@/responses/success/comment.response");
const {
  throwUnauthorizedError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { OK } = require("@/configs/http-status.config");

/**
 * Controller: Update Comment
 * Only the creator can update their own comment
 * Accessible by both admin and client (if they created the comment)
 */
const updateCommentController = async (req, res) => {
  try {
    const { commentText } = req.body;
    const comment = req.comment;

    // Determine who is updating
    const updatedBy = req.admin?.adminId || req.client?.clientId;

    // ── Call service ──────────────────────────────────────
    const result = await updateCommentService({
      comment,
      commentText,
      updatedBy,
      auditContext: {
        user: req.admin || req.client,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "You can only update your own comments") {
        logWithTime(`❌ [updateCommentController] Unauthorized update attempt | ${getLogIdentifiers(req)}`);
        return throwUnauthorizedError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [updateCommentController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwSpecificInternalServerError(res, result.message);
      }

      logWithTime(`❌ [updateCommentController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, result.error);
    }

    if (result.message === "No Changes Detected in Comment") {
      logWithTime(`⚠️ [updateCommentController] No changes detected in comment update | ${getLogIdentifiers(req)}`);
      return res.status(OK).json({
        success: true,
        message: result.message,
      });
    }

    logWithTime(`✅ [updateCommentController] Comment updated successfully | ${getLogIdentifiers(req)}`);
    return sendCommentUpdatedSuccess(res, result.comment);

  } catch (error) {
    logWithTime(`❌ [updateCommentController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateCommentController };
