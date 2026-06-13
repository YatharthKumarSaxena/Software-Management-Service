// middlewares/validations/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createValidationValidationMiddleware: validateBody("createValidation", validationSets.createValidationValidationSet),
  updateValidationValidationMiddleware: validateBody("updateValidation", validationSets.updateValidationValidationSet),
  deleteValidationValidationMiddleware: validateBody("deleteValidation", validationSets.deleteValidationValidationSet),
};

module.exports = { validationMiddlewares };
