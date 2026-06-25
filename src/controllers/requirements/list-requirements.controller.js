const { requirementServices } = require("@services/requirements");

const {
    throwBadRequestError,
    throwInternalServerError
} = require("@responses/common/error-handler.response");

const {
    sendRequirementsListSuccess
} = require("@responses/success/requirement.response");

const { logWithTime } = require("@utils/time-stamps.util");

const {
    validateAndParseJson
} = require("@/utils/validate-json-query.util");

const {
    BAD_REQUEST
} = require("@configs/http-status.config");

const {
    parseListFilters
} = require("@utils/parse-list-filters.util");

const { UserTypes } = require("@configs/enums.config");

const listRequirementsController = async (req, res) => {
    try {

        if (req.query?.query) {
            const isQueryValidResult = validateAndParseJson(
                req.query.query,
                "query"
            );

            if (!isQueryValidResult.success) {
                return throwBadRequestError(
                    res,
                    isQueryValidResult.message
                );
            }
        }

        const filters = parseListFilters(req.query);
        const projectId = req.project._id;

        const userType =
            req.admin
                ? UserTypes.USER
                : UserTypes.CLIENT;

        const result =
            await requirementServices.listRequirementsService({
                projectId,
                filters,
                userType
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
            `✅ ${result.pagination.totalCount} requirement(s) fetched successfully`
        );

        return sendRequirementsListSuccess(
            res,
            result.data,
            result.pagination
        );

    } catch (error) {

        return throwInternalServerError(
            res,
            error
        );

    }
};

module.exports = {
    listRequirementsController
};