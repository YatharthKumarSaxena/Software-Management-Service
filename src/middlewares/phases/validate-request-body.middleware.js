// middlewares/Phases/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createPhasePresenceMiddleware: checkBodyPresence("createPhasePresence", requiredFields.createPhaseField),
  updatePhaseStatusPresenceMiddleware: checkBodyPresence("updatePhaseStatusPresence", requiredFields.updatePhaseStatusField),
  updatePhaseSettingsPresenceMiddleware: checkBodyPresence("updatePhaseSettingsPresence", requiredFields.updatePhaseSettingsField),
  deletePhasePresenceMiddleware: checkBodyPresence("deletePhasePresence", requiredFields.deletePhaseField),
};

module.exports = { presenceMiddlewares };
