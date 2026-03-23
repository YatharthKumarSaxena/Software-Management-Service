// controllers/scopes/list-scopes.controller.js

const {
  listScopesAdminService,
  listScopesClientService,
} = require("@services/scopes/list-scope.service");
const { sendScopesListFetchedSuccess } = require("@/responses/success/scope.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

const listScopesController = async (req, res) => {
  try {
    const inception = req.inception;
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    // Parse query filters and pagination
    const filters = {
      inceptionId: inception._id.toString(),
      type: req.query.type || null,
      includeDeleted: req.query.includeDeleted === "true" ? true : false,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
    };

    // Call appropriate service based on user type
    const result = shouldUseRestrictedView
      ? await listScopesClientService(filters, pagination)
      : await listScopesAdminService(filters, pagination);

    if (!result.success) {
      logWithTime(`❌ [listScopesController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listScopesController] Scopes fetched successfully | ${getLogIdentifiers(req)}`);
    return sendScopesListFetchedSuccess(res, result.scopes, result.total, result.page, result.totalPages);

  } catch (error) {
    logWithTime(`❌ [listScopesController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listScopesController };
