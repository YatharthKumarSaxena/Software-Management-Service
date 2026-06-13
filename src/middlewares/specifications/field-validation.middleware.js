// middlewares/specifications/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createSpecificationValidationMiddleware: validateBody("createSpecification", validationSets.createSpecificationValidationSet),
  updateSpecificationValidationMiddleware: validateBody("updateSpecification", validationSets.updateSpecificationValidationSet),
  deleteSpecificationValidationMiddleware: validateBody("deleteSpecification", validationSets.deleteSpecificationValidationSet),
};

module.exports = { validationMiddlewares };
