// routes/comment.routes.js

const express = require("express");
const commentRouter = express.Router();

const { COMMENT_ROUTES } = require("@/configs/uri.config");
const { baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { commentControllers } = require("@controllers/comments");
const { commentMiddlewares } = require("@/middlewares/comments");
const { projectMiddlewares } = require("@/middlewares/projects");

const {
  CREATE_COMMENT,
  GET_COMMENT,
  LIST_COMMENTS,
  LIST_HIERARCHICAL_COMMENTS,
  UPDATE_COMMENT,
  DELETE_COMMENT
} = COMMENT_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares or baseAuthClientOrAdminMiddlewares
//  2. Validate entity type and fetch entity (validateEntityTypeMiddleware)
//  3. Presence middleware (createCommentPresenceMiddleware)
//  4. Validation middleware (createCommentValidationMiddleware)
//  5. Controller
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/comments/create
 * Create a new comment or reply on an entity
 * Accessible by both admin and client (stakeholder)
 * 
 * Body:
 * {
 *   entityType: "scopes|requirements|inceptions|high-level-features",
 *   entityId: "ObjectId",
 *   commentText: "string (min-max length)",
 *   parentCommentId?: "ObjectId (optional, for replies)"
 * }
 */
commentRouter.post(
  CREATE_COMMENT,
  [
    ...baseAuthClientOrAdminMiddlewares,
    commentMiddlewares.commentEntityPresenceMiddleware,
    commentMiddlewares.commentEntityValidationMiddleware,
    commentMiddlewares.createCommentPresenceMiddleware,
    commentMiddlewares.createCommentValidationMiddleware,
    commentMiddlewares.validateEntityTypeMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware
  ],
  commentControllers.createCommentController
);

/**
 * GET /software-management-service/api/v1/comments/get/:commentId
 * Fetch a single comment with its replies (if it's a root comment)
 * Accessible by both admin and client stakeholders
 */
commentRouter.get(
  GET_COMMENT,
  [
    ...baseAuthClientOrAdminMiddlewares,
    commentMiddlewares.fetchCommentMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  commentControllers.getCommentController
);

/**
 * GET /software-management-service/api/v1/comments/list/:entityType/:entityId
 * List all comments for an entity (flat list, paginated)
 * Accessible by both admin and client stakeholders
 * 
 * Query params:
 * - page (default: 1)
 * - limit (default: 20, max: 100)
 */
commentRouter.get(
  LIST_COMMENTS,
  [
    ...baseAuthClientOrAdminMiddlewares,
  ],
  commentControllers.listCommentsController
);

/**
 * GET /software-management-service/api/v1/comments/list-hierarchical/:entityType/:entityId
 * List comments with threaded replies in hierarchical structure
 * Only pagination applies to root comments, all replies are fetched
 * Accessible by both admin and client stakeholders
 * 
 * Query params:
 * - page (default: 1)
 * - limit (default: 10, max: 50)
 */
commentRouter.get(
  LIST_HIERARCHICAL_COMMENTS,
  [
    ...baseAuthClientOrAdminMiddlewares,
  ],
  commentControllers.listHierarchicalCommentsController
);

/**
 * PATCH /software-management-service/api/v1/comments/update/:commentId
 * Update a comment (only creator can update)
 * Accessible by both admin and client (if they created the comment)
 * 
 * Body:
 * {
 *   commentText: "string (min-max length)"
 * }
 */
commentRouter.patch(
  UPDATE_COMMENT,
  [
    ...baseAuthClientOrAdminMiddlewares,
    commentMiddlewares.updateCommentPresenceMiddleware,
    commentMiddlewares.updateCommentValidationMiddleware,
    commentMiddlewares.fetchCommentMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware
  ],
  commentControllers.updateCommentController
);

/**
 * DELETE /software-management-service/api/v1/comments/delete/:commentId
 * Delete a comment with access control based on user type
 * - Admin: Can delete any comment (requires deletion reason for audit)
 * - Stakeholder/Client: Can delete only their own comment (no reason required)
 * 
 * Body (for admin):
 * {
 *   deletedReason: "string (min-max length, required for admins)"
 * }
 * 
 * Body (for clients):
 * {
 *   // No body required
 * }
 */
commentRouter.delete(
  DELETE_COMMENT,
  [
    ...baseAuthClientOrAdminMiddlewares,
    commentMiddlewares.deleteCommentValidationMiddleware,
    commentMiddlewares.fetchCommentMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
  ],
  commentControllers.deleteCommentController
);

module.exports = { commentRouter };
