const { createCheckLatestPhaseNotFrozenMiddleware } = require("../factory/check-not-frozen.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const allowedPhaseMiddlewares = {
    createRequirementPhaseCheckMiddleware: createCheckLatestPhaseNotFrozenMiddleware([Phases.ELICITATION,Phases.ELABORATION],true)
};

module.exports = { 
  allowedPhaseMiddlewares
};