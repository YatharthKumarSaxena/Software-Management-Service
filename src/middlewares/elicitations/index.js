// middlewares/elicitations/index.js

const { fetchElicitationMiddleware, fetchLatestAnyStatusElicitationMiddleware, fetchLatestOpenElicitationMiddleware, fetchLatestNotFrozenElicitationMiddleware } = require("./fetch-elicitation.middleware");

const elicitationMiddlewares = {
  fetchElicitationMiddleware,
  fetchLatestAnyStatusElicitationMiddleware,
  fetchLatestOpenElicitationMiddleware,
  fetchLatestNotFrozenElicitationMiddleware
};

module.exports = { elicitationMiddlewares };
