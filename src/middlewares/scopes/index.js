// middlewares/scopes/index.js

const { fetchScopeMiddleware } = require("./fetch-scope.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const scopeMiddlewares = {
  fetchScopeMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares,
};

module.exports = { scopeMiddlewares };
