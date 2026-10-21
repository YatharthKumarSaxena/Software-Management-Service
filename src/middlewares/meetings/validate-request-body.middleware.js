const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createMeetingPresenceMiddleware: checkBodyPresence("createMeetingPresence", requiredFields.createMeetingField),
  createAutoMeetingPresenceMiddleware: checkBodyPresence("createAutoMeetingPresence", requiredFields.createAutoMeetingField),
  regenerateMeetingLinkPresenceMiddleware: checkBodyPresence("regenerateMeetingLinkPresence", requiredFields.regenerateMeetingLinkField),
  updateMeetingPresenceMiddleware: checkBodyPresence("updateMeetingPresence", requiredFields.updateMeetingField),
  cancelMeetingPresenceMiddleware: checkBodyPresence("cancelMeetingPresence", requiredFields.cancelMeetingField),
  scheduleMeetingPresenceMiddleware: checkBodyPresence("scheduleMeetingPresence", requiredFields.scheduleMeetingField),
  rescheduleMeetingPresenceMiddleware: checkBodyPresence("rescheduleMeetingPresence", requiredFields.rescheduleMeetingField),
  addParticipantPresenceMiddleware: checkBodyPresence("addParticipantPresence", requiredFields.addParticipantField),
  updateParticipantPresenceMiddleware: checkBodyPresence("updateParticipantPresence", requiredFields.updateParticipantField)
};

module.exports = { presenceMiddlewares };