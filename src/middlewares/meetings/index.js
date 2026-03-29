const { fetchMeetingMiddleware } = require("./fetch-meeting.middleware");
const { validateUserIsParticipantMiddleware } = require("./validate-user-is-participant.middleware");
const { meetingStatusGuardMiddleware } = require("./meeting-status-guard.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { fetchEntityIdMiddleware } = require("./fetch-entity-id.middleware");
const { checkPhaseFrozenStatusMiddleware } = require("./switch-freeze-entity.middleware");

const meetingMiddlewares = {
  fetchMeetingMiddleware,
  validateUserIsParticipantMiddleware,
  meetingStatusGuardMiddleware,
  fetchEntityIdMiddleware,
  checkPhaseFrozenStatusMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares
};

module.exports = {
  meetingMiddlewares
}
