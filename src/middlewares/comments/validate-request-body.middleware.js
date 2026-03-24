const { requiredFields } = require("@/configs/required-fields.config");
const { checkBodyPresence } = require("@middlewares/factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  commentEntityPresenceMiddleware: checkBodyPresence("commentEntity", requiredFields.commentEntityField),
  
  // ── CREATE COMMENT ──────────────────────────────────────
  createCommentPresenceMiddleware: checkBodyPresence("createComment", requiredFields.createCommentField),

  // ── UPDATE COMMENT ──────────────────────────────────────
  updateCommentPresenceMiddleware: checkBodyPresence("updateComment", requiredFields.updateCommentField),

  // ── DELETE COMMENT ──────────────────────────────────────
  deleteCommentPresenceMiddleware: checkBodyPresence("deleteComment", requiredFields.deleteCommentField)
};

// Export individual middlewares for backward compatibility
module.exports = {
    presenceMiddlewares
}