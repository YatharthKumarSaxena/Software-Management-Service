// responses/success/inception.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after an inception is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} inception - Newly created inception document
 */
const sendInceptionCreatedSuccess = (res, inception) => {
  return res.status(CREATED).json({
    success: true,
    message: "Inception created successfully.",
    data: {
      inception,
    },
  });
};

/**
 * Sends a 200 response with the latest inception details.
 *
 * @param {Object} res - Express response object
 * @param {Object} inception - Latest inception document
 */
const sendLatestInceptionFetchedSuccess = (res, inception) => {
  return res.status(OK).json({
    success: true,
    message: "Latest inception fetched successfully.",
    data: { inception }
  });
};

const sendInceptionFetchedSuccess = (res, inception) => {
  return res.status(OK).json({
    success: true,
    message: "Inception fetched successfully.",
    data: { inception }
  });
};

/**
 * Sends a 200 response with a list of inceptions.
 *
 * @param {Object} res - Express response object
 * @param {Object[]} inceptions - Array of inception documents
 * @param {number} total - Total count of inceptions
 */
const sendInceptionsListFetchedSuccess = (res, inceptions, total) => {
  return res.status(OK).json({
    success: true,
    message: "Inceptions fetched successfully.",
    data: {
      total,
      inceptions
    }
  });
};

/**
 * Sends a 200 response after an inception is successfully deleted.
 *
 * @param {Object} res - Express response object
 */
const sendInceptionDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "Inception deleted successfully."
  });
};

/**
 * Sends a 200 response after an inception is successfully frozen.
 *
 * @param {Object} res - Express response object
 * @param {Object} inception - Frozen inception document
 */
const sendInceptionFrozenSuccess = (res, inception) => {
  return res.status(OK).json({
    success: true,
    message: "Inception frozen successfully.",
    data: { inception }
  });
};

module.exports = {
  sendInceptionCreatedSuccess,
  sendInceptionFetchedSuccess,
  sendInceptionsListFetchedSuccess,
  sendInceptionDeletedSuccess,
  sendLatestInceptionFetchedSuccess,
  sendInceptionFrozenSuccess
};
