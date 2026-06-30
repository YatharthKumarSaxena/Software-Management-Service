// controllers/scopes/list-scopes.controller.js

const { listScopesService } = require("@services/scopes/list-scope.service");
const { sendScopesListFetchedSuccess } = require("@/responses/success/scope.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
  throwBadRequestError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { UserTypes } = require("@configs/enums.config");
const { BAD_REQUEST } = require("@configs/http-status.config");

const listScopesController = async (req, res) => {
  try {
    const inception = req.inception;
    const project = req.project;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;

    const result = await listScopesService({
      projectId: project._id,
      inceptionId: inception ? inception._id : null,
      filters,
      userType
    });

    if (!result.success) {
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      logWithTime(`❌ [listScopesController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listScopesController] Scopes fetched successfully | ${getLogIdentifiers(req)}`);
    return sendScopesListFetchedSuccess(res, result.data, result.pagination.totalCount, result.pagination.currentPage, result.pagination.totalPages);

  } catch (error) {
    logWithTime(`❌ [listScopesController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listScopesController };
