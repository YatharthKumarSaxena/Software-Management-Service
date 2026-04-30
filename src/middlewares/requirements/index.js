// middlewares/requirements/index.js

const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { fetchRequirementMiddleware } = require("./fetch-requirement.middleware");

module.exports = {
  // Presence validation
  ...presenceMiddlewares,

  // Field validation
  ...validationMiddlewares,

  // Resource fetching
  fetchRequirementMiddleware
};
