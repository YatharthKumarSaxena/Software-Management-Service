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

const {
    BAD_REQUEST
} = require("@configs/http-status.config");

const listPhaseController = async (req, res) => {
    try {

        const result = await listPhaseService({
            projectId: req.project._id,
            phaseType: req.params.phaseType,
            filters: req.filters
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
                result.message
            );
        }

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