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

/**
 * Controller: Get Stakeholder
 *
 * @route  GET /software-management-service/api/v1/admin/get-stakeholder/:stakeholderId
 * @access Private – Admin (all roles)
 *
 * @param {string} stakeholderId - MongoDB ObjectId (from URL param)
 *
 * @returns {200} Stakeholder data
 * @returns {400} Invalid ID or deleted
 * @returns {404} Not found
 * @returns {500} Internal server error
 */
const getStakeholderController = async (req, res) => {
  try {
    const stakeholder = req.foundStakeholder;
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    const result = shouldUseRestrictedView
      ? await getStakeholderClientService(stakeholder)
      : await getStakeholderAdminService(stakeholder);

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
