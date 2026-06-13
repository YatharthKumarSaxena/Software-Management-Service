// middlewares/validations/index.js

const { fetchValidationMiddleware, fetchLatestAnyStatusValidationMiddleware, fetchLatestOpenValidationMiddleware, fetchLatestNotFrozenValidationMiddleware } = require("./fetch-validation.middleware");
const { validationMiddlewares: fieldValidationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const validationMiddlewares = {
  fetchValidationMiddleware,
  fetchLatestAnyStatusValidationMiddleware,
  fetchLatestOpenValidationMiddleware,
  fetchLatestNotFrozenValidationMiddleware,
  ...presenceMiddlewares,
  ...fieldValidationMiddlewares
};

module.exports = { validationMiddlewares };
