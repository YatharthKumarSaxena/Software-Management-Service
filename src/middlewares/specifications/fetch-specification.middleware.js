const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware, createCheckLatestPhaseAnyStatusMiddleware, createCheckLatestPhaseOpenMiddleware } = require("../factory/check-latest-phase.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchSpecificationMiddleware = createFetchPhaseMiddleware(Phases.SPECIFICATION, "specificationId", "specification");
const fetchLatestAnyStatusSpecificationMiddleware =
    createCheckLatestPhaseAnyStatusMiddleware([Phases.SPECIFICATION]);

const fetchLatestOpenSpecificationMiddleware =
    createCheckLatestPhaseOpenMiddleware([Phases.SPECIFICATION]);

const fetchLatestNotFrozenSpecificationMiddleware =
    createCheckLatestPhaseNotFrozenMiddleware([Phases.SPECIFICATION]);

module.exports = { 
  fetchSpecificationMiddleware,
  fetchLatestAnyStatusSpecificationMiddleware,
  fetchLatestOpenSpecificationMiddleware,
  fetchLatestNotFrozenSpecificationMiddleware
};
