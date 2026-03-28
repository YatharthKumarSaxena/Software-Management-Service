// middlewares/elicitations/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createElicitationPresenceMiddleware: checkBodyPresence("createElicitationPresence", requiredFields.createElicitationField),
  updateElicitationPresenceMiddleware: checkBodyPresence("updateElicitationPresence", requiredFields.updateElicitationField),
  deleteElicitationPresenceMiddleware: checkBodyPresence("deleteElicitationPresence", requiredFields.deleteElicitationField)
};

module.exports = { presenceMiddlewares };
