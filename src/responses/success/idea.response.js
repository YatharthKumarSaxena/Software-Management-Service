// responses/success/idea.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after an idea is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Newly created idea document
 */
const sendIdeaCreatedSuccess = (res, idea) => {
  return res.status(CREATED).json({
    success: true,
    message: "Idea created successfully.",
    data: {
      idea,
    },
  });
};

/**
 * Sends a 200 response after an idea is successfully updated.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Updated idea document
 */
const sendIdeaUpdatedSuccess = (res, idea) => {
  return res.status(OK).json({
    success: true,
    message: "Idea updated successfully.",
    data: { idea },
  });
};

/**
 * Sends a 200 response after an idea is successfully deleted.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Deleted idea document
 */
const sendIdeaDeletedSuccess = (res, idea) => {
  return res.status(OK).json({
    success: true,
    message: "Idea deleted successfully.",
    data: { idea },
  });
};

/**
 * Sends a 200 response after an idea is successfully accepted.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Accepted idea document
 */
const sendIdeaAcceptedSuccess = (res, idea) => {
  return res.status(OK).json({
    success: true,
    message: "Idea accepted successfully.",
    data: { idea },
  });
};

/**
 * Sends a 200 response after an idea is successfully rejected.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Rejected idea document
 */
const sendIdeaRejectedSuccess = (res, idea) => {
  return res.status(OK).json({
    success: true,
    message: "Idea rejected successfully.",
    data: { idea },
  });
};

/**
 * Sends a 200 response after an idea is successfully deferred.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Deferred idea document
 */
const sendIdeaDeferredSuccess = (res, idea) => {
  return res.status(OK).json({
    success: true,
    message: "Idea deferred successfully.",
    data: { idea },
  });
};

/**
 * Sends a 200 response after an idea is successfully reopened.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Reopened idea document
 */
const sendIdeaReopenedSuccess = (res, idea) => {
  return res.status(OK).json({
    success: true,
    message: "Idea reopened successfully.",
    data: { idea },
  });
};

/**
 * Sends a 200 response after an idea is successfully revoked.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Revoked idea document
 */
const sendIdeaRevokedSuccess = (res, idea) => {
  return res.status(OK).json({
    success: true,
    message: "Idea revoked successfully.",
    data: { idea },
  });
};

/**
 * Sends a 200 response with a single idea's details.
 *
 * @param {Object} res - Express response object
 * @param {Object} idea - Idea document
 */
const sendIdeaFetchedSuccess = (res, idea) => {
  return res.status(OK).json({
    success: true,
    message: "Idea fetched successfully.",
    data: { idea },
  });
};

/**
 * Sends a 200 response with a list of ideas.
 *
 * @param {Object} res - Express response object
 * @param {Object} payload - Pagination payload
 * @param {Object[]} payload.ideas - Array of idea documents
 * @param {Object} [payload.pagination] - Optional pagination metadata {total, page, limit, totalPages}
 */
const sendIdeasListSuccess = (res, payload) => {
  const { ideas, pagination } = payload;
  
  // Support both old format (just array) and new format (object with pagination)
  if (Array.isArray(payload)) {
    return res.status(OK).json({
      success: true,
      message: "Ideas retrieved successfully.",
      data: { ideas: payload },
    });
  }

  // New format with pagination
  return res.status(OK).json({
    success: true,
    message: "Ideas retrieved successfully.",
    data: {
      ideas,
      ...(pagination && { pagination })
    },
  });
};

module.exports = {
  sendIdeaCreatedSuccess,
  sendIdeaUpdatedSuccess,
  sendIdeaDeletedSuccess,
  sendIdeaAcceptedSuccess,
  sendIdeaRejectedSuccess,
  sendIdeaDeferredSuccess,
  sendIdeaReopenedSuccess,
  sendIdeaRevokedSuccess,
  sendIdeaFetchedSuccess,
  sendIdeasListSuccess,
};
