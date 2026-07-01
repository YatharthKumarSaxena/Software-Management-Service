// controllers/constraints/list-constraints.controller.js

const { listConstraintsService } = require("@services/constraints/list-constraint.service");
const { sendConstraintsListFetchedSuccess } = require("@/responses/success/constraint.response");
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

const listConstraintsController = async (req, res) => {
  try {
    const inception = req.inception;
    const project = req.project;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    const result = await listConstraintsService({
      projectId: project._id,
      inceptionId: inception ? inception._id : null,
      filters,
      userType
    });

    if (!result.success) {
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      logWithTime(`❌ [listConstraintsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listConstraintsController] Constraints fetched successfully | ${getLogIdentifiers(req)}`);
    return sendConstraintsListFetchedSuccess(res, result.data, result.pagination.totalCount, result.pagination.currentPage, result.pagination.totalPages);

  } catch (error) {
    logWithTime(`❌ [listConstraintsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listConstraintsController };
