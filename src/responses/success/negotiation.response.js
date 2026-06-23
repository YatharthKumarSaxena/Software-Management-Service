// responses/success/negotiation.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after a negotiation is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} negotiation - Newly created negotiation document
 */
const sendNegotiationCreatedSuccess = (res, negotiation) => {
  return res.status(CREATED).json({
    success: true,
    message: "Negotiation created successfully.",
    data: {
      negotiation,
    },
  });
};

/**
 * Sends a 200 response after a negotiation is successfully updated.
 *
 * @param {Object} res - Express response object
 * @param {Object} negotiation - Updated negotiation document
 */
const sendNegotiationUpdatedSuccess = (res, negotiation, message = "Negotiation updated successfully.") => {
  return res.status(OK).json({
    success: true,
    message,
    data: { negotiation },
  });
};

/**
 * Sends a 200 response after a negotiation is successfully deleted.
 *
 * @param {Object} res - Express response object
 * @param {Object} negotiation - Deleted negotiation document
 */
const sendNegotiationDeletedSuccess = (res, negotiation) => {
  return res.status(OK).json({
    success: true,
    message: "Negotiation deleted successfully.",
    data: { negotiation },
  });
};

/**
 * Sends a 200 response with a single negotiation's details.
 *
 * @param {Object} res - Express response object
 * @param {Object} negotiation - Negotiation document
 */
const sendNegotiationRetrievedSuccess = (res, negotiation) => {
  return res.status(OK).json({
    success: true,
    message: "Negotiation retrieved successfully.",
    data: { negotiation },
  });
};

/**
 * Sends a 200 response with a list of negotiations.
 *
 * @param {Object} res - Express response object
 * @param {Array} negotiations - Array of negotiation documents
 * @param {number} totalCount - Total count of negotiations
 */
const sendNegotiationsListSuccess = (res, negotiations, totalCount) => {
  return res.status(OK).json({
    success: true,
    message: "Negotiations list retrieved successfully.",
    data: { negotiations, totalCount },
  });
};

/**
 * Sends a 200 response after a negotiation is successfully frozen.
 *
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendNegotiationFrozenSuccess = (res, message) => {
  return res.status(OK).json({
    success: true,
    message: message || "Negotiation frozen successfully."
  });
};

/**
 * Sends a 200 response with the latest negotiation.
 *
 * @param {Object} res - Express response object
 * @param {Object} negotiation - Latest negotiation document
 */
const sendLatestNegotiationRetrievedSuccess = (res, negotiation) => {
  return res.status(OK).json({
    success: true,
    message: "Latest negotiation retrieved successfully.",
    data: { negotiation },
  });
};

module.exports = {
  sendNegotiationCreatedSuccess,
  sendNegotiationUpdatedSuccess,
  sendNegotiationDeletedSuccess,
  sendNegotiationRetrievedSuccess,
  sendNegotiationsListSuccess,
  sendNegotiationFrozenSuccess,
  sendLatestNegotiationRetrievedSuccess
};
