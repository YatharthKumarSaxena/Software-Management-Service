// middlewares/elaborations/index.js

const { fetchElaborationMiddleware, fetchLatestElaborationMiddleware, fetchLatestFrozenElaborationMiddleware } = require("./fetch-elaboration.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const elaborationMiddlewares = {
  fetchElaborationMiddleware,
  fetchLatestElaborationMiddleware,
  fetchLatestFrozenElaborationMiddleware,
  ...presenceMiddlewares,
  ...validationMiddlewares
};

module.exports = { elaborationMiddlewares };
