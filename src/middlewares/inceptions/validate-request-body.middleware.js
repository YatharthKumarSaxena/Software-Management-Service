// middlewares/inceptions/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createInceptionPresenceMiddleware: checkBodyPresence("createInceptionPresence", requiredFields.createInceptionField),
  updateInceptionPresenceMiddleware: checkBodyPresence("updateInceptionPresence", requiredFields.updateInceptionField),
  deleteInceptionPresenceMiddleware: checkBodyPresence("deleteInceptionPresence", requiredFields.deleteInceptionField)
};

module.exports = { presenceMiddlewares };
