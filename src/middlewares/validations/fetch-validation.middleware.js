const { createFetchPhaseMiddleware } = require("../factory/fetch-phase.middleware-factory");
const { createCheckLatestPhaseNotFrozenMiddleware } = require("../factory/check-not-frozen.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const fetchValidationMiddleware = createFetchPhaseMiddleware(Phases.VALIDATION, "validationId", "validation");
const fetchLatestValidationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.VALIDATION],true);
const fetchLatestFrozenValidationMiddleware = createCheckLatestPhaseNotFrozenMiddleware([Phases.VALIDATION],false);

module.exports = { 
  fetchValidationMiddleware,
  fetchLatestValidationMiddleware,
  fetchLatestFrozenValidationMiddleware
};
