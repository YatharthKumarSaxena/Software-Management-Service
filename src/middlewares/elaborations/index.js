// middlewares/elaborations/index.js

const { fetchElaborationMiddleware, fetchLatestAnyStatusElaborationMiddleware, fetchLatestOpenElaborationMiddleware, fetchLatestNotFrozenElaborationMiddleware } = require("./fetch-elaboration.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const elaborationMiddlewares = {
  fetchElaborationMiddleware,
  fetchLatestAnyStatusElaborationMiddleware,
  fetchLatestOpenElaborationMiddleware,
  fetchLatestNotFrozenElaborationMiddleware,
  ...presenceMiddlewares,
  ...validationMiddlewares
};

module.exports = { elaborationMiddlewares };
