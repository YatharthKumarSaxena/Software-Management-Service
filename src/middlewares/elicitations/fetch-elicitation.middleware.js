const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware, createCheckLatestPhaseAnyStatusMiddleware, createCheckLatestPhaseOpenMiddleware } = require("../factory/check-latest-phase.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchElicitationMiddleware = createFetchPhaseMiddleware(Phases.ELICITATION, "phaseId", "elicitation");
const fetchLatestAnyStatusElicitationMiddleware =
    createCheckLatestPhaseAnyStatusMiddleware([Phases.ELICITATION]);

const fetchLatestOpenElicitationMiddleware =
    createCheckLatestPhaseOpenMiddleware([Phases.ELICITATION]);

const fetchLatestNotFrozenElicitationMiddleware =
    createCheckLatestPhaseNotFrozenMiddleware([Phases.ELICITATION]);

module.exports = { 
  fetchElicitationMiddleware,
  fetchLatestAnyStatusElicitationMiddleware,
  fetchLatestOpenElicitationMiddleware,
  fetchLatestNotFrozenElicitationMiddleware
};
