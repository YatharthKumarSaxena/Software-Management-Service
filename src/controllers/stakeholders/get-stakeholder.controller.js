// controllers/stakeholders/get-stakeholder.controller.js

const { getStakeholderAdminService, getStakeholderClientService } = require("@services/stakeholders/get-stakeholder.service");
const { resolveStakeholderName } = require("@utils/resolve-stakeholder-name.util");
const { sendStakeholderFetchedSuccess } = require("@/responses/success/stakeholder.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");

const getStakeholderController = async (req, res) => {
  try {
    const stakeholder = req.foundStakeholder;
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";
    const filters = parseListFilters(req.query);

    const result = shouldUseRestrictedView
      ? await getStakeholderClientService(stakeholder, filters)
      : await getStakeholderAdminService(stakeholder, filters);

    if (!result.success) {
      logWithTime(`❌ [getStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    if (!shouldUseRestrictedView) {
      const name = await resolveStakeholderName(result.stakeholder.userId);
      const enriched = { ...result.stakeholder, name };
      logWithTime(`✅ [getStakeholderController] Stakeholder fetched successfully | ${getLogIdentifiers(req)}`);
      return sendStakeholderFetchedSuccess(res, enriched);
    }

    logWithTime(`✅ [getStakeholderController] Stakeholder fetched successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholderFetchedSuccess(res, result.stakeholder);
  } catch (error) {
    logWithTime(`❌ [getStakeholderController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getStakeholderController };
