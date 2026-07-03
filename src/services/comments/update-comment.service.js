// services/comments/update-comment.service.js

const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { CommentModel } = require("@models/comment.model");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

/**
 * Updates a comment - only the creator can update
 * 
 * @param {Object} params
 * @param {Object} params.comment - The Comment document to update
 * @param {string} params.commentText - New comment text
 * @param {string} params.updatedBy - USR-prefixed ID of user updating (must match createdBy)
 * @param {Object} params.auditContext - { user, device, requestId }
 * @returns {{ success: boolean, comment?: Object, message?: string, error?: string }}
 */

const updateCommentService = async ({
  comment,
  commentText,
  updatedBy,
  auditContext,
}) => {
  try {
    // ── Guard: Only creator can update ───────────────────────────────────
    if (comment.createdBy !== updatedBy) {
      return { success: false, message: "You can only update your own comments" };
    }

    if (comment.commentText === commentText) {
      return { success: true, message: "No Changes Detected in Comment" }; // no DB call, no audit
    }
    const oldComment = comment;

    // ── Update comment ───────────────────────────────────────────────────
    const updateResult = await CommentModel.updateOne(
      { _id: comment._id, isDeleted: false },
      {
        $set: {
          commentText: commentText.trim(),
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return { success: false, message: "Comment not found or already deleted" };
    }

    // ── Fetch updated comment (for response + audit) ─────────────────────
    const updatedComment = await CommentModel.findById(comment._id).lean();

    // ── Activity tracker ─────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldComment, updatedComment);

    logActivityTrackerEvent({
      user: auditUser,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.UPDATE_COMMENT,
      description: `Comment updated by ${updatedBy}`,
      logOptions: {
        oldData,
        newData,
        userActions: { targetId: comment._id?.toString(), performedOn: DB_COLLECTIONS.COMMENTS },
      }
  });

    return { success: true, comment: updatedComment };

  } catch (error) {
    logWithTime(`❌ [updateCommentService] Error caught while updating comment`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }

    return { success: false, message: "Internal error while updating comment", error: error.message };
  }
};

module.exports = { updateCommentService };
