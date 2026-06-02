// middlewares/requirements/index.js

const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { fetchRequirementMiddleware } = require("./fetch-requirement.middleware");
const { allowedPhaseMiddlewares } = require("./allowed-phase.middleware");

const requirementMiddlewares = {
  ...presenceMiddlewares,
  ...validationMiddlewares,
  ...allowedPhaseMiddlewares,
  fetchRequirementMiddleware
};

module.exports = {
  requirementMiddlewares
};
