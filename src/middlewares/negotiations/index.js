// middlewares/negotiations/index.js

const { fetchNegotiationMiddleware, fetchLatestAnyStatusNegotiationMiddleware, fetchLatestOpenNegotiationMiddleware, fetchLatestNotFrozenNegotiationMiddleware } = require("./fetch-negotiation.middleware");

const negotiationMiddlewares = {
  fetchNegotiationMiddleware,
  fetchLatestAnyStatusNegotiationMiddleware,
  fetchLatestOpenNegotiationMiddleware,
  fetchLatestNotFrozenNegotiationMiddleware
};

module.exports = { negotiationMiddlewares };
