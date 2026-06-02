const { Phases } = require("@configs/enums.config");
const { throwValidationError } = require("@/responses/common/error-handler.response");

const {
    createCheckLatestPhaseNotFrozenMiddleware
} = require("../factory/check-not-frozen.middleware-factory");

const PHASE_MAPPING = {
    inceptions: Phases.INCEPTIONS,
    elicitations: Phases.ELICITATIONS,
    elaborations: Phases.ELABORATIONS,
    negotiations: Phases.NEGOTIATIONS,
    specifications: Phases.SPECIFICATIONS,
    validations: Phases.VALIDATIONS
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

        const middleware = createCheckLatestPhaseNotFrozenMiddleware(
            [phaseEnum],
            checkNotFrozen
        );

        return middleware(req, res, next);
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