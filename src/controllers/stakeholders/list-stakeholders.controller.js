// controllers/stakeholders/list-stakeholders.controller.js

const {
  listStakeholdersAdminService,
  listStakeholdersClientService,
} = require("@/services/stakeholders/list-stakeholders.service");
const { enrichStakeholdersWithName } = require("@utils/resolve-stakeholder-name.util");
const { sendStakeholdersListFetchedSuccess } = require("@/responses/success/stakeholder.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");

const listStakeholdersController = async (req, res) => {
  try {
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    const filters = parseListFilters(req.query);

    const requesterUserId = req.stakeholder?.userId || req.admin?.adminId || req.client?.clientId;
    const result = shouldUseRestrictedView
      ? await listStakeholdersClientService(filters, requesterUserId)
      : await listStakeholdersAdminService(filters);

    if (!result.success) {
      logWithTime(`❌ [listStakeholdersController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    const stakeholdersResponse = shouldUseRestrictedView
      ? result.stakeholders
      : await enrichStakeholdersWithName(result.stakeholders);

    logWithTime(`✅ [listStakeholdersController] Stakeholders list fetched successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholdersListFetchedSuccess(
      res,
      stakeholdersResponse,
      result.pagination
    );
  } catch (error) {
    logWithTime(`❌ [listStakeholdersController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listStakeholdersController };
