// middlewares/negotiations/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createNegotiationPresenceMiddleware: checkBodyPresence("createNegotiationPresence", requiredFields.createNegotiationField),
  updateNegotiationPresenceMiddleware: checkBodyPresence("updateNegotiationPresence", requiredFields.updateNegotiationField),
  deleteNegotiationPresenceMiddleware: checkBodyPresence("deleteNegotiationPresence", requiredFields.deleteNegotiationField),
};

module.exports = { presenceMiddlewares };
