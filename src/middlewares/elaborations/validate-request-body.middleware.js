// middlewares/elaborations/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createElaborationPresenceMiddleware: checkBodyPresence("createElaborationPresence", requiredFields.createElaborationField),
  updateElaborationPresenceMiddleware: checkBodyPresence("updateElaborationPresence", requiredFields.updateElaborationField),
  deleteElaborationPresenceMiddleware: checkBodyPresence("deleteElaborationPresence", requiredFields.deleteElaborationField),
};

module.exports = { presenceMiddlewares };
