// middlewares/elicitations/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = { 
  createElicitationValidationMiddleware: validateBody("createElicitation", validationSets.createElicitationValidationSet),
  updateElicitationValidationMiddleware: validateBody("updateElicitation", validationSets.updateElicitationValidationSet),
  deleteElicitationValidationMiddleware: validateBody("deleteElicitation", validationSets.deleteElicitationValidationSet)
};

module.exports = { validationMiddlewares };
