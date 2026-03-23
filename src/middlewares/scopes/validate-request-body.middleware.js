// middlewares/scopes/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("@middlewares/factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createScopePresenceMiddleware: checkBodyPresence("createScopePresence", requiredFields.createScopeField),
  updateScopePresenceMiddleware: checkBodyPresence("updateScopePresence", requiredFields.updateScopeField),
  deleteScopePresenceMiddleware: checkBodyPresence("deleteScopePresence", requiredFields.deleteScopeField)
};

module.exports = { presenceMiddlewares };
