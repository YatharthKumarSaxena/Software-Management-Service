// middlewares/negotiations/index.js

const { fetchNegotiationMiddleware, fetchLatestFrozenNegotiationMiddleware, fetchLatestNegotiationMiddleware } = require("./fetch-negotiation.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const negotiationMiddlewares = {
  fetchNegotiationMiddleware,
  fetchLatestNegotiationMiddleware,
  fetchLatestFrozenNegotiationMiddleware,
  ...presenceMiddlewares,
    ...validationMiddlewares
};

module.exports = { negotiationMiddlewares };
