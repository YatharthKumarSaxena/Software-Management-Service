// controllers/comments/index.js

const { createCommentController } = require("./create-comment.controller");
const { getCommentController } = require("./get-comment.controller");
const { listCommentsController } = require("./list-comments.controller");
const { listHierarchicalCommentsController } = require("./list-hierarchical-comments.controller");
const { updateCommentController } = require("./update-comment.controller");
const { deleteCommentController } = require("./delete-comment.controller");

const commentControllers = {
  createCommentController,
  getCommentController,
  listCommentsController,
  listHierarchicalCommentsController,
  updateCommentController,
  deleteCommentController,
};

module.exports = { commentControllers };
