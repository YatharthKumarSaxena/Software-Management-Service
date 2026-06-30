// middlewares/constraints/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("@middlewares/factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createConstraintPresenceMiddleware: checkBodyPresence("createConstraintPresence", requiredFields.createConstraintField),
  updateConstraintPresenceMiddleware: checkBodyPresence("updateConstraintPresence", requiredFields.updateConstraintField),
  deleteConstraintPresenceMiddleware: checkBodyPresence("deleteConstraintPresence", requiredFields.deleteConstraintField)
};

module.exports = { presenceMiddlewares };
