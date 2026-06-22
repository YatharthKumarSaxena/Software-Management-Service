// middlewares/factory/phase-dispatcher.middleware-factory.js

const { Phases } = require("@configs/enums.config");
const {
    throwInternalServerError,
    throwMissingFieldsError,
    throwInvalidResourceError
} = require("@responses/common/error-handler.response");

const {
    logMiddlewareError,
    getLogIdentifiers
} = require("@utils/log-error.util");

const { logWithTime } =
    require("@utils/time-stamps.util");


const createPhaseDispatcherMiddleware = (
    phaseToMiddlewareMap,
    middlewareName,
    fetchParticularPhase = false
) => {

    return async (req, res, next) => {

        try {

            const phaseType =
                req.params?.phaseType ||
                req.body?.phaseType;

            if (!phaseType) {

                logMiddlewareError(
                    middlewareName,
                    "Phase type is missing",
                    req
                );

                return throwMissingFieldsError(
                    res,
                    ["phaseType"]
                );
            }

            let phaseId = null;
            if(fetchParticularPhase){
                phaseId = req.params?.phaseId
                if (!phaseId) {

                    logMiddlewareError(
                        middlewareName,
                        "Phase Id is missing",
                        req
                    );

                    return throwMissingFieldsError(
                        res,
                        ["phaseId"]
                    );
                }
                
                req.phaseId = req.params.phaseId;
                
            }

            if (
                !Object.values(Phases)
                    .includes(phaseType)
            ) {

                logMiddlewareError(
                    middlewareName,
                    `Invalid phase type: ${phaseType}`,
                    req
                );

                return throwInvalidResourceError(
                    res,
                    `Invalid phase type: ${phaseType}`
                );
            }

            const targetMiddleware =
                phaseToMiddlewareMap[phaseType];

            if (!targetMiddleware) {

                logMiddlewareError(
                    middlewareName,
                    `Middleware not configured for ${phaseType}`,
                    req
                );

                return throwInternalServerError(
                    res,
                    new Error(
                        `Middleware not configured for ${phaseType}`
                    )
                );
            }

            logWithTime(
                `✅ [${middlewareName+"Middleware"}] Dispatching ${phaseType} | ${getLogIdentifiers(req)}`
            );

            return targetMiddleware(
                req,
                res,
                next
            );

        } catch (error) {

            logMiddlewareError(
                middlewareName,
                error.message,
                req
            );

            return throwInternalServerError(
                res,
                error
            );
        }
    };
};

module.exports = {
    createPhaseDispatcherMiddleware
};