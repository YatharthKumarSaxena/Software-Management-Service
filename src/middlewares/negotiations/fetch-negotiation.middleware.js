const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware } = require("../factory/check-not-frozen.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchNegotiationMiddleware = createFetchPhaseMiddleware(Phases.NEGOTIATION, "negotiationId", "negotiation");
const fetchLatestNegotiationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.NEGOTIATION],true);
const fetchLatestFrozenNegotiationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.NEGOTIATION],false);

module.exports = { 
  fetchNegotiationMiddleware,
  fetchLatestNegotiationMiddleware,
  fetchLatestFrozenNegotiationMiddleware
};
