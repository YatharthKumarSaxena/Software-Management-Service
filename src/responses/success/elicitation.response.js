// responses/success/elicitation.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after an elicitation is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} elicitation - Newly created elicitation document
 */
const sendElicitationCreatedSuccess = (res, elicitation) => {
  return res.status(CREATED).json({
    success: true,
    message: "Elicitation created successfully.",
    data: {
      elicitation,
    },
  });
};

/**
 * Sends a 200 response after an elicitation is successfully updated.
 *
 * @param {Object} res - Express response object
 * @param {Object} elicitation - Updated elicitation document
 */
const sendElicitationUpdatedSuccess = (res, elicitation) => {
  return res.status(OK).json({
    success: true,
    message: "Elicitation updated successfully.",
    data: { elicitation },
  });
};

/**
 * Sends a 200 response after an elicitation is successfully deleted.
 *
 * @param {Object} res - Express response object
 * @param {Object} elicitation - Deleted elicitation document
 */
const sendElicitationDeletedSuccess = (res, elicitation) => {
  return res.status(OK).json({
    success: true,
    message: "Elicitation deleted successfully.",
    data: { elicitation },
  });
};

/**
 * Sends a 200 response with a single elicitation's details.
 *
 * @param {Object} res - Express response object
 * @param {Object} elicitation - Elicitation document
 */
const sendElicitationFetchedSuccess = (res, elicitation) => {
  return res.status(OK).json({
    success: true,
    message: "Elicitation fetched successfully.",
    data: { elicitation },
  });
};

/**
 * Sends a 200 response with the latest elicitation.
 *
 * @param {Object} res - Express response object
 * @param {Object} elicitation - Latest elicitation document
 */
const sendLatestElicitationFetchedSuccess = (res, elicitation) => {
  return res.status(OK).json({
    success: true,
    message: "Latest elicitation fetched successfully.",
    data: { elicitation },
  });
};

/**
 * Sends a 200 response with a list of elicitations.
 *
 * @param {Object} res - Express response object
 * @param {Object[]} elicitations - Array of elicitation documents
 */
const sendElicitationsListSuccess = (res, elicitations) => {
  return res.status(OK).json({
    success: true,
    message: "Elicitations retrieved successfully.",
    data: { elicitations },
  });
};

/**
 * Sends a 200 response after an elicitation is successfully frozen.
 *
 * @param {Object} res - Express response object
 * @param {Object} elicitation - Frozen elicitation document
 */
const sendElicitationFrozenSuccess = (res, elicitation) => {
  return res.status(OK).json({
    success: true,
    message: "Elicitation frozen successfully.",
    data: { elicitation },
  });
};

module.exports = {
  sendElicitationCreatedSuccess,
  sendElicitationUpdatedSuccess,
  sendElicitationDeletedSuccess,
  sendElicitationFetchedSuccess,
  sendLatestElicitationFetchedSuccess,
  sendElicitationsListSuccess,
  sendElicitationFrozenSuccess,
};
