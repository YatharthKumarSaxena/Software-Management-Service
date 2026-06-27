const {
    listPhaseService
} = require("@services/phases/list-phase.service");

const {
    throwBadRequestError,
    throwInternalServerError
} = require("@responses/common/error-handler.response");

const {
    fetchPhasesListSuccessResponse
} = require("@responses/success/phase.response");

const { logWithTime } = require("@utils/time-stamps.util");

const {
    BAD_REQUEST
} = require("@configs/http-status.config");

const {
    parseListFilters
} = require("@utils/parse-list-filters.util");

const listPhaseController = async (req, res) => {
    try {

        const filters = parseListFilters(req.query);

        const result = await listPhaseService({
            projectId: req.project._id,
            phaseType: req.params.phaseType,
            filters: filters
        });

        if (!result.success) {

            if (result.errorCode === BAD_REQUEST) {
                return throwBadRequestError(
                    res,
                    result.message
                );
            }

            return throwInternalServerError(
                res,
                new Error(result.message)
            );
        }

        logWithTime(
            `✅ ${result.pagination.totalCount} ${req.params.phaseType}(s) fetched successfully`
        );

        return fetchPhasesListSuccessResponse(
            res,
            req.params.phaseType,
            result.data,
            result.pagination,
            result.message
        );

    } catch (error) {

        return throwInternalServerError(
            res,
            error
        );

    }
};

module.exports = {
    listPhaseController
};