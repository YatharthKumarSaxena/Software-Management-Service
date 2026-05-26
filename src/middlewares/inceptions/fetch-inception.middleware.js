const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware } = require("../factory/check-not-frozen.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchInceptionMiddleware = createFetchPhaseMiddleware(Phases.INCEPTION, "inceptionId", "inception");
const fetchLatestInceptionMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.INCEPTION],true);
const fetchLatestFrozenInceptionMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.INCEPTION],false);

module.exports = { 
  fetchInceptionMiddleware,
  fetchLatestInceptionMiddleware,
  fetchLatestFrozenInceptionMiddleware
};
