
const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const validationMiddlewares = {
  phaseRoleActionValidationMiddleware: validateBody("phaseRoleAction", validationSets.phaseRoleActionValidationSet)
};

const presenceMiddlewares = {
  phaseRoleActionPresenceMiddleware: checkBodyPresence("phaseRoleAction", requiredFields.phaseRoleActionField)
};

module.exports = { validationMiddlewares, presenceMiddlewares };