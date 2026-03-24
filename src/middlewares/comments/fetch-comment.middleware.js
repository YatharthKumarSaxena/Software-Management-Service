// middlewares/comments/fetch-comment.middleware.js

const { CommentModel } = require("@models/comment.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { getLogIdentifiers, throwDBResourceNotFoundError, throwBadRequestError, throwInternalServerError, logMiddlewareError, throwValidationError, throwAccessDeniedError } = require("@/responses/common/error-handler.response");
const { isValidMongoID } = require("@/utils/id-validators.util");
const { ProjectCategoryTypes } = require("@/configs/enums.config");
const { checkUserRoleType } = require("@/utils/role-check.util");

/**
 * Fetch comment by ID from route params (:commentId)
 * Validates that the user belongs to the project associated with the comment
 * Attaches comment to req.comment
 * 
 * @middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * @returns {void}
 */

const fetchCommentMiddleware = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      logMiddlewareError(`fetchComment`, `Missing commentId in params`, req);
      return throwBadRequestError(res, "Comment ID not provided");
    }

    if (!isValidMongoID(commentId)) {
      logMiddlewareError(`fetchComment`, `Invalid commentId format: ${commentId}`, req);
      return throwValidationError(res, ["Comment ID format"]);
    }

    const comment = await CommentModel.findOne({ _id: commentId, isDeleted: false }).lean();

    if (!comment) {
      logMiddlewareError(`fetchComment`, `Comment not found: ${commentId}`, req);
      return throwDBResourceNotFoundError(res, "Comment");
    }

    // ── Validate user project membership ──────────────────────────────────
    const userId = req?.admin?.adminId || req?.client?.clientId;
    const projectId = comment.projectId;

    const stakeholder = await StakeholderModel.findOne({
      userId: userId,
      projectId: projectId,
      isDeleted: false
    }).lean();

    if (!stakeholder) {
      logMiddlewareError(
        `fetchComment`,
        `User ${userId} is not a stakeholder of project ${projectId} for comment ${commentId}`,
        req
      );
      return throwAccessDeniedError(res, "You do not have permission to access this comment.");
    }

    req.projectId = projectId; // Attach projectId to request for downstream middlewares/services

    logWithTime(`✅ Fetched comment ${commentId} for request ${getLogIdentifiers(req)}`);
    // Attach comment to request object
    req.comment = comment;
    return next();

  } catch (error) {
    logMiddlewareError(`fetchComment`,` Error: ${error.message} `, req);
    return throwInternalServerError(res, "Error fetching comment");
  }
};

module.exports = {
  fetchCommentMiddleware
};
