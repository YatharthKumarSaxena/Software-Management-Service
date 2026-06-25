const { createCheckLatestPhaseNotFrozenMiddleware, createCheckLatestPhaseOpenMiddleware } = require("../factory/check-latest-phase.middleware-factory");
const { Phases } = require("@/configs/enums.config");

const allowedPhaseMiddlewares = {
    createRequirementPhaseCheckMiddleware: createCheckLatestPhaseOpenMiddleware([Phases.ELICITATION,Phases.ELABORATION]),
    updateRequirementPhaseCheckMiddleware: createCheckLatestPhaseNotFrozenMiddleware([Phases.ELICITATION,Phases.ELABORATION,Phases.NEGOTIATION]),
    refineRequirementPhaseCheckMiddleware: createCheckLatestPhaseNotFrozenMiddleware([Phases.ELICITATION,Phases.ELABORATION])
};

module.exports = { 
  allowedPhaseMiddlewares
};