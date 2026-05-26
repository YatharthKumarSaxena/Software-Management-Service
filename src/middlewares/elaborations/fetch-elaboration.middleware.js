const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware } = require("../factory/check-not-frozen.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchElaborationMiddleware = createFetchPhaseMiddleware(Phases.ELABORATION, "elaborationId", "elaboration");
const fetchLatestElaborationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.ELABORATION],true);
const fetchLatestFrozenElaborationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.ELABORATION],false);

module.exports = { 
  fetchElaborationMiddleware,
  fetchLatestElaborationMiddleware,
  fetchLatestFrozenElaborationMiddleware
};
