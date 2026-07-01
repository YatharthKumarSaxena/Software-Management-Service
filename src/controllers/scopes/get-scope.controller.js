// controllers/scopes/get-scope.controller.js

const { getScopeService } = require("@services/scopes/get-scope.service");
const { sendScopeFetchedSuccess } = require("@/responses/success/scope.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { TotalTypes } = require("@configs/enums.config");

const getScopeController = async (req, res) => {
  try {
    const scope = req.foundScope || req.scope;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    const result = await getScopeService({
      scope,
      selectFields: filters.selectFields,
      userType
    });

    if (!result.success) {
      logWithTime(`❌ [getScopeController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getScopeController] Scope fetched successfully | ${getLogIdentifiers(req)}`);
    return sendScopeFetchedSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ [getScopeController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getScopeController };
