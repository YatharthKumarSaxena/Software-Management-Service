const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware, createCheckLatestPhaseAnyStatusMiddleware, createCheckLatestPhaseOpenMiddleware } = require("../factory/check-latest-phase.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchInceptionMiddleware = createFetchPhaseMiddleware(Phases.INCEPTION, "phaseId", "inception");

const fetchLatestAnyStatusInceptionMiddleware =
    createCheckLatestPhaseAnyStatusMiddleware([Phases.INCEPTION]);

const fetchLatestOpenInceptionMiddleware =
    createCheckLatestPhaseOpenMiddleware([Phases.INCEPTION]);

const fetchLatestNotFrozenInceptionMiddleware =
    createCheckLatestPhaseNotFrozenMiddleware([Phases.INCEPTION]);

module.exports = { 
  fetchInceptionMiddleware,
  fetchLatestAnyStatusInceptionMiddleware,
  fetchLatestOpenInceptionMiddleware,
  fetchLatestNotFrozenInceptionMiddleware
};
