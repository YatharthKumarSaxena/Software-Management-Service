// middlewares/constraints/index.js

const { fetchConstraintMiddleware } = require("./fetch-constraint.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const constraintMiddlewares = {
  fetchConstraintMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares,
};

module.exports = { constraintMiddlewares };
