// controllers/phases/get-latest-phase.controller.js

const {
    getLogIdentifiers,
    throwInternalServerError
} = require("@responses/common/error-handler.response");

const {
    fetchLatestPhaseSuccessResponse
} = require("@responses/success/phase.response");

const {
    logWithTime
} = require("@utils/time-stamps.util");

const getLatestPhaseController =
async (req, res) => {

    try {

        const {
            phaseType
        } = req.params;

        const latestPhase =
            req.latestPhases?.[phaseType];


        logWithTime(
            `✅ [getLatestPhaseController] Latest ${phaseType} retrieved successfully | ${getLogIdentifiers(req)}`
        );

        return fetchLatestPhaseSuccessResponse(
            res,
            phaseType,
            latestPhase,
            `Latest ${phaseType} phase retrieved successfully`
        );

    } catch (error) {

        logWithTime(
            `❌ [getLatestPhaseController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
        );

        return throwInternalServerError(
            res,
            error
        );
    }
};

module.exports = {
    getLatestPhaseController
};