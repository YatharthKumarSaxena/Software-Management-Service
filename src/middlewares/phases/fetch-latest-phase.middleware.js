// fetch-latest-phase.middleware.js

const { inceptionMiddlewares } = require("@middlewares/inceptions"); 
const { elicitationMiddlewares } = require("@middlewares/elicitations"); 
const { elaborationMiddlewares } = require("@middlewares/elaborations"); 
const { negotiationMiddlewares } = require("@middlewares/negotiations"); 
const { specificationMiddlewares } = require("@middlewares/specifications"); 
const { validationMiddlewares } = require("@middlewares/validations"); 
const { Phases } = require("@/configs/enums.config");

const {
    createPhaseDispatcherMiddleware
} = require("../factory/phase-dispatcher.middleware-factory");

const phaseToLatestMiddlewareMap = {
    [Phases.INCEPTION]:
        inceptionMiddlewares.fetchLatestNotFrozenInceptionMiddleware,

    [Phases.ELICITATION]:
        elicitationMiddlewares.fetchLatestNotFrozenElicitationMiddleware,

    [Phases.ELABORATION]:
        elaborationMiddlewares.fetchLatestNotFrozenElaborationMiddleware,

    [Phases.NEGOTIATION]:
        negotiationMiddlewares.fetchLatestNotFrozenNegotiationMiddleware,

    [Phases.SPECIFICATION]:
        specificationMiddlewares.fetchLatestNotFrozenSpecificationMiddleware,

    [Phases.VALIDATION]:
        validationMiddlewares.fetchLatestNotFrozenValidationMiddleware
};

const fetchLatestPhaseMiddleware =
    createPhaseDispatcherMiddleware(
        phaseToLatestMiddlewareMap,
        "fetchLatestPhase",
        false
    );

module.exports = {
    fetchLatestPhaseMiddleware
};