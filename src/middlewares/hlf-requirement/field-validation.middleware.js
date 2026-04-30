// middlewares/hlf-requirement/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = { 
  linkRequirementToHlfValidationMiddleware: validateBody("linkRequirementToHlf", validationSets.linkRequirementToHlfValidationSet),
  updateRequirementToHlfValidationMiddleware: validateBody("updateRequirementToHlf", validationSets.updateRequirementToHlfValidationSet),
  unlinkRequirementToHlfValidationMiddleware: validateBody("unlinkRequirementToHlf", validationSets.unlinkRequirementToHlfValidationSet)
};

module.exports = { validationMiddlewares };
