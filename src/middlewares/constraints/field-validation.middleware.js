// middlewares/constraints/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createConstraintValidationMiddleware: validateBody("createConstraint", validationSets.createConstraintValidationSet),
  updateConstraintValidationMiddleware: validateBody("updateConstraint", validationSets.updateConstraintValidationSet),
  deleteConstraintValidationMiddleware: validateBody("deleteConstraint", validationSets.deleteConstraintValidationSet)
};

module.exports = { validationMiddlewares };
