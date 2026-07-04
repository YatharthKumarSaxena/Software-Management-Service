// middlewares/conversions/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createConversionValidationMiddleware: validateBody("createConversion", validationSets.createConversionValidationSet)
};

module.exports = { validationMiddlewares };
