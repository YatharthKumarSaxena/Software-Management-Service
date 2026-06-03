// middlewares/negotiations/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createNegotiationValidationMiddleware: validateBody("createNegotiation", validationSets.createNegotiationValidationSet),
  updateNegotiationValidationMiddleware: validateBody("updateNegotiation", validationSets.updateNegotiationValidationSet),
  deleteNegotiationValidationMiddleware: validateBody("deleteNegotiation", validationSets.deleteNegotiationValidationSet),
};

module.exports = { validationMiddlewares };
