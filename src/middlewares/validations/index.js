// middlewares/validations/index.js

const { fetchValidationMiddleware, fetchLatestAnyStatusValidationMiddleware, fetchLatestOpenValidationMiddleware, fetchLatestNotFrozenValidationMiddleware } = require("./fetch-validation.middleware");

const validationMiddlewares = {
  fetchValidationMiddleware,
  fetchLatestAnyStatusValidationMiddleware,
  fetchLatestOpenValidationMiddleware,
  fetchLatestNotFrozenValidationMiddleware
};

module.exports = { validationMiddlewares };
