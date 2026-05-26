const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware } = require("../factory/check-not-frozen.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchElicitationMiddleware = createFetchPhaseMiddleware(Phases.ELICITATION, "elicitationId", "elicitation");
const fetchLatestElicitationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.ELICITATION],true);
const fetchLatestFrozenElicitationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.ELICITATION],false);

module.exports = { 
  fetchElicitationMiddleware,
  fetchLatestElicitationMiddleware,
  fetchLatestFrozenElicitationMiddleware
};
