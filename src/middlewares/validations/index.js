// middlewares/validations/index.js

const { fetchValidationMiddleware, fetchLatestFrozenValidationMiddleware, fetchLatestValidationMiddleware } = require("./fetch-validation.middleware");
const { validationMiddlewares: fieldValidationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const validationMiddlewares = {
  fetchValidationMiddleware,
  fetchLatestValidationMiddleware,
  fetchLatestFrozenValidationMiddleware,
  ...presenceMiddlewares,
  ...fieldValidationMiddlewares
};

module.exports = { validationMiddlewares };
