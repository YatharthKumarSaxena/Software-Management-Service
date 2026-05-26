// responses/success/elaboration.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after an elaboration is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} elaboration - Newly created elaboration document
 */
const sendElaborationCreatedSuccess = (res, elaboration) => {
  return res.status(CREATED).json({
    success: true,
    message: "Elaboration created successfully.",
    data: {
      elaboration,
    },
  });
};

/**
 * Sends a 200 response after an elaboration is successfully updated.
 *
 * @param {Object} res - Express response object
 * @param {Object} elaboration - Updated elaboration document
 */
const sendElaborationUpdatedSuccess = (res, elaboration) => {
  return res.status(OK).json({
    success: true,
    message: "Elaboration updated successfully.",
    data: { elaboration },
  });
};

/**
 * Sends a 200 response after an elaboration is successfully deleted.
 *
 * @param {Object} res - Express response object
 * @param {Object} elaboration - Deleted elaboration document
 */
const sendElaborationDeletedSuccess = (res, elaboration) => {
  return res.status(OK).json({
    success: true,
    message: "Elaboration deleted successfully.",
    data: { elaboration },
  });
};

/**
 * Sends a 200 response with a single elaboration's details.
 *
 * @param {Object} res - Express response object
 * @param {Object} elaboration - Elaboration document
 */
const sendElaborationRetrievedSuccess = (res, elaboration) => {
  return res.status(OK).json({
    success: true,
    message: "Elaboration retrieved successfully.",
    data: { elaboration },
  });
};

/**
 * Sends a 200 response with a list of elaborations.
 *
 * @param {Object} res - Express response object
 * @param {Array} elaborations - Array of elaboration documents
 * @param {number} totalCount - Total count of elaborations
 */
const sendElaborationsListSuccess = (res, elaborations, totalCount) => {
  return res.status(OK).json({
    success: true,
    message: "Elaborations list retrieved successfully.",
    data: { elaborations, totalCount },
  });
};

/**
 * Sends a 200 response after an elaboration is successfully frozen.
 *
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendElaborationFrozenSuccess = (res, message) => {
  return res.status(OK).json({
    success: true,
    message: message || "Elaboration frozen successfully."
  });
};

/**
 * Sends a 200 response with the latest elaboration.
 *
 * @param {Object} res - Express response object
 * @param {Object} elaboration - Latest elaboration document
 */
const sendLatestElaborationRetrievedSuccess = (res, elaboration) => {
  return res.status(OK).json({
    success: true,
    message: "Latest elaboration retrieved successfully.",
    data: { elaboration },
  });
};

module.exports = {
  sendElaborationCreatedSuccess,
  sendElaborationUpdatedSuccess,
  sendElaborationDeletedSuccess,
  sendElaborationRetrievedSuccess,
  sendElaborationsListSuccess,
  sendElaborationFrozenSuccess,
  sendLatestElaborationRetrievedSuccess
};
