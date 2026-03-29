const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createMeetingPresenceMiddleware: checkBodyPresence("createMeetingPresence", requiredFields.createMeetingField),
  updateMeetingPresenceMiddleware: checkBodyPresence("updateMeetingPresence", requiredFields.updateMeetingField),
  cancelMeetingPresenceMiddleware: checkBodyPresence("cancelMeetingPresence", requiredFields.cancelMeetingField),
  addParticipantPresenceMiddleware: checkBodyPresence("addParticipantPresence", requiredFields.addParticipantField),
  updateParticipantPresenceMiddleware: checkBodyPresence("updateParticipantPresence", requiredFields.updateParticipantField)
};

module.exports = { presenceMiddlewares };