// services/comments/delete-comment.service.js

const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { CommentModel } = require("@models/comment.model");
const { UserTypes } = require("@/configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

/**
 * Soft-delete a comment with proper access control
 * - Stakeholders can delete only their own comments (no reason required)
 * - Admins can delete any comment (reason must be provided for audit)
 * 
 * @param {Object} params
 * @param {Object} params.comment - The Comment document to delete
 * @param {string} params.deletedBy - USR-prefixed ID of user deleting
 * @param {string} params.userType - Type of user: 'STAKEHOLDER' or 'ADMIN'
 * @param {string} [params.deletedReason] - Reason for deletion (required for admins)
 * @param {Object} params.auditContext - { user, device, requestId }
 * @returns {{ success: boolean, message?: string, error?: string }}
 */
const deleteCommentService = async ({
  comment,
  deletedBy,
  userType,
  deletedReason = null,
  auditContext,
}) => {
  try {
    
    // ── Guard: Client can only delete own ───────────────────
    if (userType === UserTypes.CLIENT && comment.createdBy !== deletedBy) {
      return { success: false, message: "You can only delete your own comments" };
    }

    // ── Guard: Admin deleting others must provide reason ───
    if (
      userType !== UserTypes.CLIENT &&
      comment.createdBy !== deletedBy &&
      !deletedReason
    ) {
      return {
        success: false,
        message: "Deletion reason is required when deleting others' comments",
      };
    }

    const oldComment = comment; // lean ho ya doc, dono me safe

    const updateResult = await CommentModel.updateOne(
      { _id: comment._id, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
          deletedReason
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return { success: false, message: "Failed to delete comment" };
    }

    // ── Activity tracker ─────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData } = prepareAuditData(oldComment, null);

    let activityMessage = `Comment deleted by ${deletedBy}`;
    if (userType === UserTypes.CLIENT) {
      activityMessage = `Comment deleted by stakeholder ${deletedBy}`;
    } else {
      activityMessage = `Comment deleted by admin ${deletedBy} — Reason: ${deletedReason}`;
    }

    logActivityTrackerEvent({
      user: auditUser,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.DELETE_COMMENT,
      description: activityMessage,
      logOptions: {
        oldData,
        userActions: { targetId: comment._id?.toString(), performedOn: DB_COLLECTIONS.COMMENTS },
      }
  });

    return { success: true };

  } catch (error) {
    logWithTime(`❌ [deleteCommentService] Error caught while deleting comment`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[deleteCommentService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[deleteCommentService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while deleting comment", error: error.message };
  }
};

module.exports = { deleteCommentService };
