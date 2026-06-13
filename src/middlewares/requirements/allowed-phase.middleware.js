const { createCheckLatestPhaseNotFrozenMiddleware } = require("../factory/check-latest-phase.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const allowedPhaseMiddlewares = {
    createRequirementPhaseCheckMiddleware: createCheckLatestPhaseNotFrozenMiddleware([Phases.ELICITATION,Phases.ELABORATION],true)
};

module.exports = { 
  allowedPhaseMiddlewares
};