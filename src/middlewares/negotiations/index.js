// middlewares/negotiations/index.js

const { fetchNegotiationMiddleware, fetchLatestAnyStatusNegotiationMiddleware, fetchLatestOpenNegotiationMiddleware, fetchLatestNotFrozenNegotiationMiddleware } = require("./fetch-negotiation.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const negotiationMiddlewares = {
  fetchNegotiationMiddleware,
  fetchLatestAnyStatusNegotiationMiddleware,
  fetchLatestOpenNegotiationMiddleware,
  fetchLatestNotFrozenNegotiationMiddleware,
  ...presenceMiddlewares,
    ...validationMiddlewares
};

module.exports = { negotiationMiddlewares };
