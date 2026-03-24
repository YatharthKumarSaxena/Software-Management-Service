// middlewares/comments/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

/**
 * Comment field validation middlewares using factory pattern
 * 
 * Separation:
 * - checkBodyPresence: Validates required fields are present
 * - validateBody: Validates field formats, lengths, enums
 */

const validationMiddlewares = {
  // ── CREATE COMMENT ENTITY (entityType + entityId validation) ────────────
  commentEntityValidationMiddleware: validateBody("commentEntity", validationSets.commentEntityValidationSet),

  // ── CREATE COMMENT ──────────────────────────────────────
  createCommentValidationMiddleware: validateBody("createComment", validationSets.createCommentValidationSet),

  // ── UPDATE COMMENT ──────────────────────────────────────
  updateCommentValidationMiddleware: validateBody("updateComment", validationSets.updateCommentValidationSet),

  // ── DELETE COMMENT ──────────────────────────────────────
  deleteCommentValidationMiddleware: validateBody("deleteComment", validationSets.deleteCommentValidationSet)
};

// Export individual middlewares for backward compatibility
module.exports = {
    validationMiddlewares
};
