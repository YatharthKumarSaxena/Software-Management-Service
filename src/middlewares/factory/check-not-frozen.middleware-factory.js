const mongoose = require("mongoose");

const { Phases } = require("@configs/enums.config");

const {
    throwAccessDeniedError,
    throwBadRequestError,
    throwDBResourceNotFoundError,
    throwInternalServerError,
    logMiddlewareError,
} = require("@responses/common/error-handler.response");

const { logWithTime } = require("@utils/time-stamps.util");

const createCheckLatestPhaseNotFrozenMiddleware = (
    phasesArray,
    checkNotFrozen = true
) => {

    // ============================================
    // FACTORY VALIDATIONS
    // ============================================

    if (!Array.isArray(phasesArray) || phasesArray.length === 0) {
        throw new Error(
            "createCheckLatestPhaseNotFrozenMiddleware: phasesArray must be a non-empty array"
        );
    }

    if (typeof checkNotFrozen !== "boolean") {
        throw new Error(
            "createCheckLatestPhaseNotFrozenMiddleware: checkNotFrozen must be a boolean"
        );
    }

    const validPhases = Object.values(Phases);

    // ============================================
    // Validate all phase enums
    // ============================================

    for (const phaseEnum of phasesArray) {

        if (!validPhases.includes(phaseEnum)) {
            throw new Error(
                `Invalid phaseEnum "${phaseEnum}". Allowed values: ${validPhases.join(", ")}`
            );
        }

        const Model = mongoose.models[phaseEnum];

        if (!Model) {
            throw new Error(
                `No mongoose model registered for phase "${phaseEnum}"`
            );
        }
    }

    return async (req, res, next) => {

        try {

            const projectId = req?.project?._id || req.params.projectId;

            if (!projectId) {
                return throwBadRequestError(
                    res,
                    "projectId is required"
                );
            }

            // ============================================
            // Fetch latest phases
            // ============================================

            const latestPhases = {};

            for (const phaseEnum of phasesArray) {

                const Model = mongoose.models[phaseEnum];

                const latestPhase = await Model.findOne({
                    projectId,
                    isDeleted: false
                })
                    .sort({
                        "version.major": -1,
                        "version.minor": -1,
                        createdAt: -1
                    })
                    .lean();

                if (latestPhase) {
                    latestPhases[phaseEnum] = latestPhase;
                    // plural → singular
                    const requestKey = phaseEnum.slice(0, -1);

                    // req.inception
                    // req.elicitation
                    // req.elaboration
                    req[requestKey] = latestPhase;
                }
            }

            const existingPhases = Object.values(latestPhases);

            // ============================================
            // Guard: At least one latest phase must exist
            // ============================================

            if (existingPhases.length === 0) {

                logMiddlewareError(
                    "checkLatestPhaseNotFrozenMiddleware",
                    `No latest phases found for projectId: ${projectId}`,
                    req
                );

                const requestedPhaseNames = phasesArray.map(
                    phase => phase.slice(0, -1)
                );

                return throwDBResourceNotFoundError(
                    res,
                    `Latest phases not found: ${requestedPhaseNames.join(", ")}`,
                    projectId
                );
            }

            // ============================================
            // Skip frozen check if disabled
            // ============================================

            if (checkNotFrozen === false) {

                logWithTime(
                    `⏭️ [checkLatestPhaseNotFrozenMiddleware] Frozen check skipped`
                );

                return next();
            }

            // ============================================
            // Check if at least one phase is NOT frozen
            // ============================================

            const anyPhaseNotFrozen = Object.values(latestPhases).some(
                (phase) => phase.isFrozen === false
            );

            if (!anyPhaseNotFrozen) {

                const frozenPhases = Object.keys(latestPhases);

                logWithTime(
                    `⚠️ [checkLatestPhaseNotFrozenMiddleware] All latest phases are frozen: ${frozenPhases.join(", ")}`
                );

                const frozenPhaseNames = frozenPhases.map(
                    phase => phase.slice(0, -1)
                );

                return throwAccessDeniedError(
                    res, `Latest phases are frozen: ${frozenPhaseNames.join(", ")}`);

            }

            // ============================================
            // Success
            // ============================================

            const unlockedPhases = Object.entries(latestPhases)
                .filter(([_, phase]) => phase.isFrozen === false)
                .map(([phaseKey]) => phaseKey);

            logWithTime(
                `✅ [checkLatestPhaseNotFrozenMiddleware] Unlocked phases: ${unlockedPhases.join(", ")}`
            );

            req.projectId = projectId;
            return next();

        } catch (error) {

            logMiddlewareError(
                "checkLatestPhaseNotFrozenMiddleware",
                error.message,
                req
            );

            return throwInternalServerError(res, error);
        }
    };
};

module.exports = {
    createCheckLatestPhaseNotFrozenMiddleware
};