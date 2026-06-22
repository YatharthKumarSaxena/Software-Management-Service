// middlewares/negotiations/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createPhaseValidationMiddleware: validateBody("createPhase", validationSets.createPhaseValidationSet),
  updatePhaseStatusValidationMiddleware: validateBody("updatePhaseStatus", validationSets.updatePhaseStatusValidationSet),
  updatePhaseSettingsValidationMiddleware: validateBody("updatePhaseSettings", validationSets.updatePhaseSettingsValidationSet),
  deletePhaseValidationMiddleware: validateBody("deletePhase", validationSets.deletePhaseValidationSet),
};

module.exports = { validationMiddlewares };
