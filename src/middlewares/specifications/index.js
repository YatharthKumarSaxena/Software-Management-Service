// middlewares/specifications/index.js

const { fetchSpecificationMiddleware, fetchLatestFrozenSpecificationMiddleware, fetchLatestSpecificationMiddleware } = require("./fetch-specification.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const specificationMiddlewares = {
  fetchSpecificationMiddleware,
  fetchLatestSpecificationMiddleware,
  fetchLatestFrozenSpecificationMiddleware,
  ...presenceMiddlewares,
  ...validationMiddlewares
};

module.exports = { specificationMiddlewares };
