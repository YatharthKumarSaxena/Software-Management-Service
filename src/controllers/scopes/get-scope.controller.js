// controllers/scopes/get-scope.controller.js

const {
  getScopeAdminService,
  getScopeClientService,
} = require("@services/scopes/get-scope.service");
const { sendScopeFetchedSuccess } = require("@/responses/success/scope.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

const getScopeController = async (req, res) => {
  try {
    const scope = req.foundScope || req.scope;
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    const result = shouldUseRestrictedView
      ? await getScopeClientService(scope)
      : await getScopeAdminService(scope);

    if (!result.success) {
      logWithTime(`❌ [getScopeController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getScopeController] Scope fetched successfully | ${getLogIdentifiers(req)}`);
    return sendScopeFetchedSuccess(res, result.scope);

  } catch (error) {
    logWithTime(`❌ [getScopeController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getScopeController };
