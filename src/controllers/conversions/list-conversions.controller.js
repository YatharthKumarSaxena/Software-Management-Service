// controllers/conversions/list-conversions.controller.js

const { listConversionsService } = require("@services/conversions/list-conversions.service");
const { sendConversionsListFetchedSuccess } = require("@/responses/success/conversion.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
  throwBadRequestError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { TotalTypes } = require("@configs/enums.config");
const { BAD_REQUEST } = require("@configs/http-status.config");

const listConversionsController = async (req, res) => {
  try {
    const project = req.project;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    const result = await listConversionsService({
      projectId: project._id.toString(),
      filters,
      userType
    });

    if (!result.success) {
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      logWithTime(`❌ [listConversionsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listConversionsController] Conversions fetched successfully | ${getLogIdentifiers(req)}`);
    return sendConversionsListFetchedSuccess(res, result.data, result.pagination.totalCount, result.pagination.currentPage, result.pagination.totalPages);

  } catch (error) {
    logWithTime(`❌ [listConversionsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listConversionsController };
