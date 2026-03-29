/**
 * Participant Response Handlers
 * 
 * Sends standardized success responses for participant operations.
 */

const { OK, CREATED } = require("@configs/http-status.config");

/**
 * Send participant added success response
 */
const sendParticipantAddedSuccess = (res, participant) => {
  return res.status(CREATED).json({
    success: true,
    message: "Participant added successfully",
    data: participant
  });
};

/**
 * Send participant removed success response
 */
const sendParticipantRemovedSuccess = (res, participant) => {
  return res.status(OK).json({
    success: true,
    message: "Participant removed successfully",
    data: participant
  });
};

/**
 * Send participant updated success response
 */
const sendParticipantUpdatedSuccess = (res, participant) => {
  return res.status(OK).json({
    success: true,
    message: "Participant updated successfully",
    data: participant
  });
};

/**
 * Send single participant fetch success response
 */
const sendParticipantFetchedSuccess = (res, participant) => {
  return res.status(OK).json({
    success: true,
    message: "Participant fetched successfully",
    data: participant
  });
};

/**
 * Send participants list success response
 */
const sendParticipantsListSuccess = (res, participants, count) => {
  return res.status(OK).json({
    success: true,
    message: `Found ${count} participant(s)`,
    data: participants,
    count: count
  });
};

module.exports = {
  sendParticipantAddedSuccess,
  sendParticipantRemovedSuccess,
  sendParticipantUpdatedSuccess,
  sendParticipantFetchedSuccess,
  sendParticipantsListSuccess
};
