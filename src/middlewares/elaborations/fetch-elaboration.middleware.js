const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware, createCheckLatestPhaseAnyStatusMiddleware, createCheckLatestPhaseOpenMiddleware } = require("../factory/check-latest-phase.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchElaborationMiddleware = createFetchPhaseMiddleware(Phases.ELABORATION, "phaseId", "elaboration");
const fetchLatestAnyStatusElaborationMiddleware =
    createCheckLatestPhaseAnyStatusMiddleware([Phases.ELABORATION]);

const fetchLatestOpenElaborationMiddleware =
    createCheckLatestPhaseOpenMiddleware([Phases.ELABORATION]);

const fetchLatestNotFrozenElaborationMiddleware =
    createCheckLatestPhaseNotFrozenMiddleware([Phases.ELABORATION]);

module.exports = { 
  fetchElaborationMiddleware,
  fetchLatestAnyStatusElaborationMiddleware,
  fetchLatestOpenElaborationMiddleware,
  fetchLatestNotFrozenElaborationMiddleware
};
