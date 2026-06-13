const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware, createCheckLatestPhaseAnyStatusMiddleware, createCheckLatestPhaseOpenMiddleware } = require("../factory/check-latest-phase.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchNegotiationMiddleware = createFetchPhaseMiddleware(Phases.NEGOTIATION, "negotiationId", "negotiation");
const fetchLatestAnyStatusNegotiationMiddleware =
    createCheckLatestPhaseAnyStatusMiddleware([Phases.NEGOTIATION]);

const fetchLatestOpenNegotiationMiddleware =
    createCheckLatestPhaseOpenMiddleware([Phases.NEGOTIATION]);

const fetchLatestNotFrozenNegotiationMiddleware =
    createCheckLatestPhaseNotFrozenMiddleware([Phases.NEGOTIATION]);

module.exports = { 
  fetchNegotiationMiddleware,
  fetchLatestAnyStatusNegotiationMiddleware,
  fetchLatestOpenNegotiationMiddleware,
  fetchLatestNotFrozenNegotiationMiddleware
};
