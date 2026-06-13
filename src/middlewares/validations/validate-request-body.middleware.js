// middlewares/validations/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createValidationPresenceMiddleware: checkBodyPresence("createValidationPresence", requiredFields.createValidationField),
  updateValidationPresenceMiddleware: checkBodyPresence("updateValidationPresence", requiredFields.updateValidationField),
  deleteValidationPresenceMiddleware: checkBodyPresence("deleteValidationPresence", requiredFields.deleteValidationField),
};

module.exports = { presenceMiddlewares };
