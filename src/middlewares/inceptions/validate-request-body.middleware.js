// middlewares/inceptions/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  deleteInceptionPresenceMiddleware: checkBodyPresence("deleteInceptionPresence", requiredFields.deleteInceptionField)
};

module.exports = { presenceMiddlewares };
