// responses/success/specification.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after a specification is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} specification - Newly created specification document
 */
const sendSpecificationCreatedSuccess = (res, specification) => {
  return res.status(CREATED).json({
    success: true,
    message: "Specification created successfully.",
    data: {
      specification,
    },
  });
};

/**
 * Sends a 200 response after a specification is successfully updated.
 *
 * @param {Object} res - Express response object
 * @param {Object} specification - Updated specification document
 */
const sendSpecificationUpdatedSuccess = (res, specification) => {
  return res.status(OK).json({
    success: true,
    message: "Specification updated successfully.",
    data: { specification },
  });
};

/**
 * Sends a 200 response after a specification is successfully deleted.
 *
 * @param {Object} res - Express response object
 * @param {Object} specification - Deleted specification document
 */
const sendSpecificationDeletedSuccess = (res, specification) => {
  return res.status(OK).json({
    success: true,
    message: "Specification deleted successfully.",
    data: { specification },
  });
};

/**
 * Sends a 200 response with a single specification's details.
 *
 * @param {Object} res - Express response object
 * @param {Object} specification - Specification document
 */
const sendSpecificationRetrievedSuccess = (res, specification) => {
  return res.status(OK).json({
    success: true,
    message: "Specification retrieved successfully.",
    data: { specification },
  });
};

/**
 * Sends a 200 response with a list of specifications.
 *
 * @param {Object} res - Express response object
 * @param {Array} specifications - Array of specification documents
 * @param {number} totalCount - Total count of specifications
 */
const sendSpecificationsListSuccess = (res, specifications, totalCount) => {
  return res.status(OK).json({
    success: true,
    message: "Specifications list retrieved successfully.",
    data: { specifications, totalCount },
  });
};

/**
 * Sends a 200 response after a specification is successfully frozen.
 *
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendSpecificationFrozenSuccess = (res, message) => {
  return res.status(OK).json({
    success: true,
    message: message || "Specification frozen successfully."
  });
};

/**
 * Sends a 200 response with the latest specification.
 *
 * @param {Object} res - Express response object
 * @param {Object} specification - Latest specification document
 */
const sendLatestSpecificationRetrievedSuccess = (res, specification) => {
  return res.status(OK).json({
    success: true,
    message: "Latest specification retrieved successfully.",
    data: { specification },
  });
};

module.exports = {
  sendSpecificationCreatedSuccess,
  sendSpecificationUpdatedSuccess,
  sendSpecificationDeletedSuccess,
  sendSpecificationRetrievedSuccess,
  sendSpecificationsListSuccess,
  sendSpecificationFrozenSuccess,
  sendLatestSpecificationRetrievedSuccess
};
