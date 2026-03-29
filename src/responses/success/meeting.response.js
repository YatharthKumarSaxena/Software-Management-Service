// responses/success/meeting.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after a meeting is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} meeting - Newly created meeting document
 */
const sendMeetingCreatedSuccess = (res, meeting) => {
  return res.status(CREATED).json({
    success: true,
    message: "Meeting created successfully.",
    data: {
      meeting,
    },
  });
};

/**
 * Sends a 200 response after a meeting is successfully updated.
 *
 * @param {Object} res - Express response object
 * @param {Object} meeting - Updated meeting document
 */
const sendMeetingUpdatedSuccess = (res, meeting) => {
  return res.status(OK).json({
    success: true,
    message: "Meeting updated successfully.",
    data: { meeting },
  });
};

/**
 * Sends a 200 response after a meeting is successfully cancelled.
 *
 * @param {Object} res - Express response object
 * @param {Object} meeting - Cancelled meeting document
 */
const sendMeetingCancelledSuccess = (res, meeting) => {
  return res.status(OK).json({
    success: true,
    message: "Meeting cancelled successfully.",
    data: { meeting },
  });
};

/**
 * Sends a 200 response with a single meeting's details.
 *
 * @param {Object} res - Express response object
 * @param {Object} meeting - Meeting document
 */
const sendMeetingFetchedSuccess = (res, meeting) => {
  return res.status(OK).json({
    success: true,
    message: "Meeting fetched successfully.",
    data: { meeting },
  });
};

/**
 * Sends a 200 response with a list of meetings.
 *
 * @param {Object} res - Express response object
 * @param {Array} meetings - Array of meeting documents
 * @param {Object} pagination - Pagination metadata {page, limit, total, pages}
 */
const sendMeetingsListSuccess = (res, meetings, pagination) => {
  return res.status(OK).json({
    success: true,
    message: "Meetings list fetched successfully.",
    data: { 
      meetings,
      pagination 
    },
  });
};

module.exports = {
  sendMeetingCreatedSuccess,
  sendMeetingUpdatedSuccess,
  sendMeetingCancelledSuccess,
  sendMeetingFetchedSuccess,
  sendMeetingsListSuccess
};
