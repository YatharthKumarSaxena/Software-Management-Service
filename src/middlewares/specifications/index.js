// middlewares/specifications/index.js

const { fetchSpecificationMiddleware, fetchLatestAnyStatusSpecificationMiddleware, fetchLatestOpenSpecificationMiddleware, fetchLatestNotFrozenSpecificationMiddleware } = require("./fetch-specification.middleware");

const specificationMiddlewares = {
  fetchSpecificationMiddleware,
  fetchLatestAnyStatusSpecificationMiddleware,
  fetchLatestOpenSpecificationMiddleware,
  fetchLatestNotFrozenSpecificationMiddleware
};

module.exports = { specificationMiddlewares };
