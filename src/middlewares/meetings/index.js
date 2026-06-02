const { fetchMeetingMiddleware } = require("./fetch-meeting.middleware");
const { validateUserIsParticipantMiddleware } = require("./validate-user-is-participant.middleware");
const { meetingStatusGuardMiddleware, meetingFinalizedGuardMiddleware } = require("./meeting-status-guard.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { fetchEntityIdMiddleware, fetchEntityIdWithoutFrozenCheckMiddleware } = require("./fetch-entity-id.middleware");

const meetingMiddlewares = {
  fetchMeetingMiddleware,
  validateUserIsParticipantMiddleware,
  meetingStatusGuardMiddleware,
  meetingFinalizedGuardMiddleware,
  fetchEntityIdMiddleware,
  fetchEntityIdWithoutFrozenCheckMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares
};

module.exports = {
  meetingMiddlewares
}
