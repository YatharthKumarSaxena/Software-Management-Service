const mongoose = require("mongoose");

const {
    PhaseStatus
} = require("@configs/enums.config");

const {
    throwAccessDeniedError,
    throwBadRequestError,
    throwDBResourceNotFoundError,
    throwInternalServerError,
    logMiddlewareError,
} = require("@responses/common/error-handler.response");

const { logWithTime } = require("@utils/time-stamps.util");

const { getPhaseStatus } = require("@utils/phase-status.util");

const createCheckLatestPhaseStatusMiddleware =
    (allowedStatuses = []) => {

        // ============================================
        // Validate Allowed Statuses
        // ============================================

        if (
            !Array.isArray(allowedStatuses) ||
            allowedStatuses.length === 0
        ) {
            throw new Error(
                "allowedStatuses must be a non-empty array"
            );
        }

        const validStatuses =
            Object.values(PhaseStatus);

        for (const status of allowedStatuses) {

            if (!validStatuses.includes(status)) {
                throw new Error(
                    `Invalid phase status: ${status}`
                );
            }
        }

        // ============================================
        // Return Phase Factory
        // ============================================

        return (phasesArray = []) => {

            if (
                !Array.isArray(phasesArray) ||
                phasesArray.length === 0
            ) {
                throw new Error(
                    "phasesArray must be a non-empty array"
                );
            }

            for (const phaseEnum of phasesArray) {

                if (!mongoose.models[phaseEnum]) {
                    throw new Error(
                        `No mongoose model registered for phase "${phaseEnum}"`
                    );
                }
            }

            // ============================================
            // Return Middleware
            // ============================================

            return async (req, res, next) => {

                try {

                    const projectId =
                        req?.project?._id ||
                        req.params.projectId;

                    if (!projectId) {
                        return throwBadRequestError(
                            res,
                            "projectId is required"
                        );
                    }

                    // ============================================
                    // Fetch Latest Phases
                    // ============================================

                    const latestPhases = {};

                    for (const phaseEnum of phasesArray) {

                        const Model =
                            mongoose.models[phaseEnum];

                        const latestPhase =
                            await Model.findOne({
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

                            latestPhases[phaseEnum] =
                                latestPhase;

                            const requestKey =
                                phaseEnum.slice(0, -1);

                            req[requestKey] =
                                latestPhase;
                        }
                    }

                    const existingPhases =
                        Object.values(
                            latestPhases
                        );

                    // ============================================
                    // Guard
                    // ============================================

                    if (
                        existingPhases.length === 0
                    ) {

                        logMiddlewareError(
                            "createCheckLatestPhaseStatusMiddleware",
                            `No latest phases found for projectId: ${projectId}`,
                            req
                        );

                        const requestedPhaseNames =
                            phasesArray.map(
                                phase =>
                                    phase.slice(0, -1)
                            );

                        return throwDBResourceNotFoundError(
                            res,
                            `Latest phases not found: ${requestedPhaseNames.join(", ")}`,
                            projectId
                        );
                    }

                    // ============================================
                    // Status Validation
                    // ============================================

                    const anyMatched =
                        existingPhases.some(
                            phase =>
                                allowedStatuses.includes(
                                    getPhaseStatus(
                                        phase
                                    )
                                )
                        );

                    if (!anyMatched) {

                        logMiddlewareError(
                            "createCheckLatestPhaseStatusMiddleware",
                            `No matching phase found for statuses: ${allowedStatuses.join(", ")}`,
                            req
                        );

                        return throwAccessDeniedError(
                            res,
                            `At least one latest phase must be in status: ${allowedStatuses.join(", ")}`
                        );
                    }

                    // ============================================
                    // Success Logging
                    // ============================================

                    const matchedPhases =
                        Object.entries(
                            latestPhases
                        )
                        .filter(
                            ([_, phase]) =>
                                allowedStatuses.includes(
                                    getPhaseStatus(
                                        phase
                                    )
                                )
                        )
                        .map(
                            ([phaseKey, phase]) =>
                                `${phaseKey.slice(0, -1)} (${getPhaseStatus(phase)})`
                        );

                    logWithTime(
                        `✅ Latest phases matched for statuses [${allowedStatuses.join(", ")}]: ${matchedPhases.join(", ")}`
                    );

                    req.projectId = projectId.toString();
                    req.latestPhases = latestPhases;

                    return next();

                } catch (error) {

                    logMiddlewareError(
                        "createCheckLatestPhaseStatusMiddleware",
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
    };

// ============================================
// Wrapper Middlewares
// ============================================

const createCheckLatestPhaseOpenMiddleware =
    createCheckLatestPhaseStatusMiddleware([
        PhaseStatus.OPEN
    ]);

const createCheckLatestPhaseNotFrozenMiddleware =
    createCheckLatestPhaseStatusMiddleware([
        PhaseStatus.OPEN,
        PhaseStatus.STABILIZING
    ]);

const createCheckLatestPhaseAnyStatusMiddleware =
    createCheckLatestPhaseStatusMiddleware([
        PhaseStatus.OPEN,
        PhaseStatus.STABILIZING,
        PhaseStatus.FROZEN
    ]);

// ============================================
// Exports
// ============================================

module.exports = {
    createCheckLatestPhaseOpenMiddleware,
    createCheckLatestPhaseNotFrozenMiddleware,
    createCheckLatestPhaseAnyStatusMiddleware
};

