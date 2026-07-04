// middlewares/conversions/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("@middlewares/factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createConversionPresenceMiddleware: checkBodyPresence("createConversionPresence", requiredFields.createConversionField)
};

module.exports = { presenceMiddlewares };
