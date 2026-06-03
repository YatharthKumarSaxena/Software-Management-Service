// middlewares/elaborations/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createElaborationValidationMiddleware: validateBody("createElaboration", validationSets.createElaborationValidationSet),
  updateElaborationValidationMiddleware: validateBody("updateElaboration", validationSets.updateElaborationValidationSet),
  deleteElaborationValidationMiddleware: validateBody("deleteElaboration", validationSets.deleteElaborationValidationSet),
};

module.exports = { validationMiddlewares };
