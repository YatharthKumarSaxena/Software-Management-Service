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
    data: { project },
  });
};

const sendProjectAbortedSuccess = (res, project) => {
  return res.status(OK).json({
    success: true,
    message: "Project aborted successfully.",
    data: { project },
  });
};

const sendProjectCompletedSuccess = (res, project) => {
  return res.status(OK).json({
    success: true,
    message: "Project marked as completed successfully.",
    data: { project },
  });
};

const sendProjectResumedSuccess = (res, project) => {
  return res.status(OK).json({
    success: true,
    message: "Project resumed successfully.",
    data: { project },
  });
};

const sendProjectDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "Project deleted successfully.",
  });
};

const sendProjectArchivedSuccess = (res, project) => {
  return res.status(OK).json({
    success: true,
    message: "Project archived successfully.",
    data: { project },
  });
};

/**
 * Sends a 200 response with a single project's details.
 *
 * @param {Object} res     - Express response object
 * @param {Object} project - Project document
 */
const sendProjectFetchedSuccess = (res, project) => {
  return res.status(OK).json({
    success: true,
    message: "Project fetched successfully.",
    data: { project },
  });
};

/**
 * Sends a 200 response with a paginated list of projects.
 *
 * @param {Object} res
 * @param {Object[]} projects
 * @param {number}   total
 * @param {number}   page
 * @param {number}   totalPages
 */
const sendProjectsListFetchedSuccess = (res, projects, total, page, totalPages) => {
  return res.status(OK).json({
    success: true,
    message: "Projects fetched successfully.",
    data: {
      projects,
      pagination: { total, page, totalPages },
    },
  });
};

module.exports = {
  sendProjectCreatedSuccess,
  sendProjectUpdatedSuccess,
  sendProjectAbortedSuccess,
  sendProjectCompletedSuccess,
  sendProjectResumedSuccess,
  sendProjectDeletedSuccess,
  sendProjectArchivedSuccess,
  sendProjectFetchedSuccess,
  sendProjectsListFetchedSuccess,
};
