// responses/success/project.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after a project is successfully created.
 *
 * @param {Object} res     - Express response object
 * @param {Object} project - Newly created project document
 */
const sendProjectCreatedSuccess = (res, project) => {
  return res.status(CREATED).json({
    success: true,
    message: "Project created successfully.",
    data: {
      project,
    },
  });
};

/**
 * Sends a 200 response after a project is successfully updated.
 *
 * @param {Object} res     - Express response object
 * @param {Object} project - Updated project document (new version)
 */
const sendProjectUpdatedSuccess = (res, project) => {
  return res.status(OK).json({
    success: true,
    message: "Project updated successfully.",
    data: {
      project,
    },
  });
};

module.exports = {
  sendProjectCreatedSuccess,
  sendProjectUpdatedSuccess,
};
