// middlewares/comments/index.js

const { fetchCommentMiddleware } = require("./fetch-comment.middleware");
const { validateEntityTypeMiddleware } = require("./validate-entity-type.middleware");
const {
  validationMiddlewares
} = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware")

const commentMiddlewares = {
  fetchCommentMiddleware,
  validateEntityTypeMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares
};

module.exports = { commentMiddlewares };
