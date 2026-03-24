// responses/success/comment.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * 201 – Comment created successfully.
 */
const sendCommentCreatedSuccess = (res, comment) => {
  return res.status(CREATED).json({
    success: true,
    message: "Comment created successfully.",
    data: { comment },
  });
};

/**
 * 200 – Comment updated successfully.
 */
const sendCommentUpdatedSuccess = (res, comment) => {
  return res.status(OK).json({
    success: true,
    message: "Comment updated successfully.",
    data: { comment },
  });
};

/**
 * 200 – Comment deleted (soft) successfully.
 */
const sendCommentDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "Comment deleted successfully.",
  });
};

/**
 * 200 – Single comment fetched successfully.
 */
const sendCommentFetchedSuccess = (res, comment, replies = []) => {
  return res.status(OK).json({
    success: true,
    message: "Comment fetched successfully.",
    data: { comment, replies },
  });
};

/**
 * 200 – Flat list of comments fetched successfully.
 */
const sendCommentsListSuccess = (res, comments, total, page, pages) => {
  return res.status(OK).json({
    success: true,
    message: "Comments fetched successfully.",
    data: {
      comments,
      pagination: { total, page, pages },
    },
  });
};

/**
 * 200 – Hierarchical list of comments (with threaded replies) fetched successfully.
 */
const sendHierarchicalCommentsListSuccess = (res, comments, total, page, pages) => {
  return res.status(OK).json({
    success: true,
    message: "Comments with replies fetched successfully.",
    data: {
      comments,
      pagination: { total, page, pages },
    },
  });
};

module.exports = {
  sendCommentCreatedSuccess,
  sendCommentUpdatedSuccess,
  sendCommentDeletedSuccess,
  sendCommentFetchedSuccess,
  sendCommentsListSuccess,
  sendHierarchicalCommentsListSuccess,
};
