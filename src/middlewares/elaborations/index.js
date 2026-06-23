// middlewares/elaborations/index.js

const { fetchElaborationMiddleware, fetchLatestAnyStatusElaborationMiddleware, fetchLatestOpenElaborationMiddleware, fetchLatestNotFrozenElaborationMiddleware } = require("./fetch-elaboration.middleware");

const elaborationMiddlewares = {
  fetchElaborationMiddleware,
  fetchLatestAnyStatusElaborationMiddleware,
  fetchLatestOpenElaborationMiddleware,
  fetchLatestNotFrozenElaborationMiddleware
};

module.exports = { elaborationMiddlewares };
