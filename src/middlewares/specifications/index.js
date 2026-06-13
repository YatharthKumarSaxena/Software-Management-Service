// middlewares/specifications/index.js

const { fetchSpecificationMiddleware, fetchLatestAnyStatusSpecificationMiddleware, fetchLatestOpenSpecificationMiddleware, fetchLatestNotFrozenSpecificationMiddleware } = require("./fetch-specification.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const specificationMiddlewares = {
  fetchSpecificationMiddleware,
  fetchLatestAnyStatusSpecificationMiddleware,
  fetchLatestOpenSpecificationMiddleware,
  fetchLatestNotFrozenSpecificationMiddleware,
  ...presenceMiddlewares,
  ...validationMiddlewares
};

module.exports = { specificationMiddlewares };
