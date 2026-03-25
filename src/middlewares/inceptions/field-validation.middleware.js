// middlewares/inceptions/field-validation.middleware.js

const { validationSets } = require("@configs/validation-sets.config");
const { validateBody } = require("../factory/field-validation.middleware-factory");

const validationMiddlewares = {
  deleteInceptionValidationMiddleware: validateBody("deleteInception", validationSets.deleteInceptionValidationSet)
};

module.exports = { validationMiddlewares };
