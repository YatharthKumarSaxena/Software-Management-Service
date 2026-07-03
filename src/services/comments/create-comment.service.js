// services/comments/create-comment.service.js

const { CommentModel } = require("@models/comment.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

/**
 * Creates a new comment or reply on an entity.
 * 
 * @param {Object} params
 * @param {Object} params.commentEntityData - { entityType, entityId, subEntityType, entity, projectId }
 * @param {string} params.commentText - The comment text
 * @param {string} params.createdBy - USR-prefixed ID of comment creator (admin or client)
 * @param {string} [params.parentCommentId] - Optional parent comment ID for replies
 * @param {Object} params.auditContext - { user, device, requestId }
 * @returns {{ success: boolean, comment?: Object, message?: string, error?: string }}
 */
const createCommentService = async ({
  commentEntityData,
  commentText,
  createdBy,
  parentCommentId,
  auditContext,
}) => {
  try {
    const { entityType, entityId, subEntityType, projectId } = commentEntityData;

    // ── Validate parent comment if reply ──────────────────────────────────
    if (parentCommentId) {

      const parentComment = await CommentModel
        .findOne({ _id: parentCommentId, isDeleted: false })
        .select("entityType entityId subEntityType")
        .lean();

      if (!parentComment) {
        return { success: false, message: "Parent comment not found" };
      }

      // Parent reply should have same entityType and entityId
      if (
        parentComment.entityType !== entityType ||
        parentComment.entityId.toString() !== entityId.toString() ||
        (parentComment.subEntityType ?? null) !== (subEntityType ?? null)
      ) {
        return { success: false, message: "Reply must match same entity and sub-entity type" };
      }
    }

    // ── Create comment ───────────────────────────────────────────────────
    const commentData = {
      entityType,
      entityId,
      projectId,
      subEntityType: subEntityType ?? null,
      parentCommentId: parentCommentId || null,
      commentText: commentText.trim(),
      createdBy,
    };

    const comment = await CommentModel.create(commentData);

    // ── Activity tracker ─────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const actionType = parentCommentId ? ACTIVITY_TRACKER_EVENTS.REPLIED_ON_COMMENT : ACTIVITY_TRACKER_EVENTS.CREATE_COMMENT;

    logActivityTrackerEvent({
      user: auditUser,
      device,
      requestId,
      eventType: actionType,
      description: `Comment created on ${entityType} (ID: ${entityId}) by ${createdBy}`,
      logOptions: {
        newData: prepareAuditData(null, comment).newData,
        userActions: { targetId: comment._id?.toString(), performedOn: DB_COLLECTIONS.COMMENTS },
      }
    });

    return { success: true, comment };

  } catch (error) {
    logWithTime(`❌ [createCommentService] Error caught while creating comment`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[createCommentService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[createCommentService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while creating comment", error: error.message };
  }
};

module.exports = { createCommentService };
