// middlewares/scopes/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createScopeValidationMiddleware: validateBody("createScope", validationSets.createScopeValidationSet),
  updateScopeValidationMiddleware: validateBody("updateScope", validationSets.updateScopeValidationSet),
  deleteScopeValidationMiddleware: validateBody("deleteScope", validationSets.deleteScopeValidationSet)
};

module.exports = { validationMiddlewares };
