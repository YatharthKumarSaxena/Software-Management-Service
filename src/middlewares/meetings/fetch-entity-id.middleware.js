const { Phases } = require("@configs/enums.config");
const { throwValidationError } = require("@/responses/common/error-handler.response");

const { createCheckLatestPhaseNotFrozenMiddleware, createCheckLatestPhaseAnyStatusMiddleware } = require("../factory/check-latest-phase.middleware-factory");

const PHASE_MAPPING = {
    inceptions: Phases.INCEPTION,
    elicitations: Phases.ELICITATION,
    elaborations: Phases.ELABORATION,
    negotiations: Phases.NEGOTIATION,
    specifications: Phases.SPECIFICATION,
    validations: Phases.VALIDATION
};

const createFetchEntityMiddleware = (checkNotFrozen = true) => {

    return async (req, res, next) => {

        const { entityType } = req.params;

        const phaseEnum = PHASE_MAPPING[entityType];

        if (!phaseEnum) {
            return throwValidationError(res, [{
                field: "entityType",
                message: `entityType must be one of: ${Object.keys(PHASE_MAPPING).join(", ")}`,
                received: entityType
            }]);
        }

        let middleware;

        if (checkNotFrozen) {
            middleware = createCheckLatestPhaseNotFrozenMiddleware(
                [phaseEnum]
            );
        }
        else {
            middleware = createCheckLatestPhaseAnyStatusMiddleware(
                [phaseEnum]
            );
        }

        return middleware(req, res, () => {
            req.parentEntity = req.latestPhases?.[phaseEnum] || req[phaseEnum.slice(0, -1)];
            return next();
        });
    };
};

// CREATE / UPDATE / DELETE / FREEZE etc.
const fetchEntityIdMiddleware =
    createFetchEntityMiddleware(true);

// GET / LIST
const fetchEntityIdWithoutFrozenCheckMiddleware =
    createFetchEntityMiddleware(false);

module.exports = {
    fetchEntityIdMiddleware,
    fetchEntityIdWithoutFrozenCheckMiddleware
};