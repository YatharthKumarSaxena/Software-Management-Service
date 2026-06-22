// fetch-phase.middleware.js

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

const phaseToMiddlewareMap = {
    [Phases.INCEPTION]:
        inceptionMiddlewares.fetchInceptionMiddleware,

    [Phases.ELICITATION]:
        elicitationMiddlewares.fetchElicitationMiddleware,

    [Phases.ELABORATION]:
        elaborationMiddlewares.fetchElaborationMiddleware,

    [Phases.NEGOTIATION]:
        negotiationMiddlewares.fetchNegotiationMiddleware,

    [Phases.SPECIFICATION]:
        specificationMiddlewares.fetchSpecificationMiddleware,

    [Phases.VALIDATION]:
        validationMiddlewares.fetchValidationMiddleware
};

const fetchPhaseMiddleware =
    createPhaseDispatcherMiddleware(
        phaseToMiddlewareMap,
        "fetchPhase",
        true
    );

module.exports = {
    fetchPhaseMiddleware
};