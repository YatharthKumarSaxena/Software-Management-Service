const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware, createCheckLatestPhaseAnyStatusMiddleware, createCheckLatestPhaseOpenMiddleware } = require("../factory/check-latest-phase.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchValidationMiddleware = createFetchPhaseMiddleware(Phases.VALIDATION, "phaseId", "validation");
const fetchLatestAnyStatusValidationMiddleware =
    createCheckLatestPhaseAnyStatusMiddleware([Phases.VALIDATION]);

const fetchLatestOpenValidationMiddleware =
    createCheckLatestPhaseOpenMiddleware([Phases.VALIDATION]);

const fetchLatestNotFrozenValidationMiddleware =
    createCheckLatestPhaseNotFrozenMiddleware([Phases.VALIDATION]);

module.exports = { 
  fetchValidationMiddleware,
  fetchLatestAnyStatusValidationMiddleware,
  fetchLatestOpenValidationMiddleware,
  fetchLatestNotFrozenValidationMiddleware
};
