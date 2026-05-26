const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware } = require("../factory/check-not-frozen.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchSpecificationMiddleware = createFetchPhaseMiddleware(Phases.SPECIFICATION, "specificationId", "specification");
const fetchLatestSpecificationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.SPECIFICATION],true);
const fetchLatestFrozenSpecificationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.SPECIFICATION],false);

module.exports = { 
  fetchSpecificationMiddleware,
  fetchLatestSpecificationMiddleware,
  fetchLatestFrozenSpecificationMiddleware
};
