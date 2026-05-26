// responses/success/validation.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after a validation is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} validation - Newly created validation document
 */
const sendValidationCreatedSuccess = (res, validation) => {
  return res.status(CREATED).json({
    success: true,
    message: "Validation created successfully.",
    data: {
      validation,
    },
  });
};

/**
 * Sends a 200 response after a validation is successfully updated.
 *
 * @param {Object} res - Express response object
 * @param {Object} validation - Updated validation document
 */
const sendValidationUpdatedSuccess = (res, validation) => {
  return res.status(OK).json({
    success: true,
    message: "Validation updated successfully.",
    data: { validation },
  });
};

/**
 * Sends a 200 response after a validation is successfully deleted.
 *
 * @param {Object} res - Express response object
 * @param {Object} validation - Deleted validation document
 */
const sendValidationDeletedSuccess = (res, validation) => {
  return res.status(OK).json({
    success: true,
    message: "Validation deleted successfully.",
    data: { validation },
  });
};

/**
 * Sends a 200 response with a single validation's details.
 *
 * @param {Object} res - Express response object
 * @param {Object} validation - Validation document
 */
const sendValidationRetrievedSuccess = (res, validation) => {
  return res.status(OK).json({
    success: true,
    message: "Validation retrieved successfully.",
    data: { validation },
  });
};

/**
 * Sends a 200 response with a list of validations.
 *
 * @param {Object} res - Express response object
 * @param {Array} validations - Array of validation documents
 * @param {number} totalCount - Total count of validations
 */
const sendValidationsListSuccess = (res, validations, totalCount) => {
  return res.status(OK).json({
    success: true,
    message: "Validations list retrieved successfully.",
    data: { validations, totalCount },
  });
};

/**
 * Sends a 200 response after a validation is successfully frozen.
 *
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendValidationFrozenSuccess = (res, message) => {
  return res.status(OK).json({
    success: true,
    message: message || "Validation frozen successfully."
  });
};

/**
 * Sends a 200 response with the latest validation.
 *
 * @param {Object} res - Express response object
 * @param {Object} validation - Latest validation document
 */
const sendLatestValidationRetrievedSuccess = (res, validation) => {
  return res.status(OK).json({
    success: true,
    message: "Latest validation retrieved successfully.",
    data: { validation },
  });
};

module.exports = {
  sendValidationCreatedSuccess,
  sendValidationUpdatedSuccess,
  sendValidationDeletedSuccess,
  sendValidationRetrievedSuccess,
  sendValidationsListSuccess,
  sendValidationFrozenSuccess,
  sendLatestValidationRetrievedSuccess
};
