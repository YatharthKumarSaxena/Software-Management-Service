// controllers/comments/delete-comment.controller.js

const { deleteCommentService } = require("@services/comments/delete-comment.service");
const { sendCommentDeletedSuccess } = require("@/responses/success/comment.response");
const {
  throwUnauthorizedError,
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { UserTypes, TotalTypes } = require("@/configs/enums.config");

/**
 * Controller: Delete Comment
 * - Admin: Can delete any comment (must provide deletion reason for audit)
 * - Stakeholder (client): Can delete only their own comment (no reason required)
 */
const deleteCommentController = async (req, res) => {
  try {
    const { deletedReason } = req.body;
    const comment = req.comment;

    // Determine who is deleting and their type
    const isAdmin = !!req.admin;
    const deletedBy = req.admin?.adminId || req.client?.clientId;
    const userType = isAdmin ? TotalTypes.ADMIN : UserTypes.CLIENT;

    // ── Call service ──────────────────────────────────────
    const result = await deleteCommentService({
      comment,
      deletedBy,
      userType,
      deletedReason: deletedReason || null,
      auditContext: {
        user: req.admin || req.client,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "You can only delete your own comments") {
        logWithTime(`❌ [deleteCommentController] Unauthorized deletion attempt | ${getLogIdentifiers(req)}`);
        return throwUnauthorizedError(res, result.message);
      }

      if (result.message === "Deletion reason is required when deleting others' comments") {
        logWithTime(`❌ [deleteCommentController] Deletion reason required | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [deleteCommentController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [deleteCommentController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [deleteCommentController] Comment deleted successfully | ${getLogIdentifiers(req)}`);
    return sendCommentDeletedSuccess(res);

  } catch (error) {
    logWithTime(`❌ [deleteCommentController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteCommentController };
