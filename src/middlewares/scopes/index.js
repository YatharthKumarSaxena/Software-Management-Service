// middlewares/scopes/index.js

const { fetchScopeMiddleware } = require("./fetch-scope.middleware");
const { fetchInceptionFromProjectMiddleware } = require("./fetch-inception-from-project.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const scopeMiddlewares = {
  fetchScopeMiddleware,
  fetchInceptionFromProjectMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares,
};

module.exports = { scopeMiddlewares };
