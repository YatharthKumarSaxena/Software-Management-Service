// controllers/projects/list-projects.controller.js

const { listProjectsAdminService, listProjectsClientService } = require("@services/projects/list-project.service");
const { sendProjectsListFetchedSuccess } = require("@/responses/success/project.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");

const listProjectsController = async (req, res) => {
  try {
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    const filters = parseListFilters(req.query);

    const requesterUserId = req.stakeholder?.userId || req.admin?.adminId || req.client?.clientId;
    const result = shouldUseRestrictedView
      ? await listProjectsClientService(filters, requesterUserId)
      : await listProjectsAdminService(filters);

    if (!result.success) {
      logWithTime(`❌ [listProjectsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ Projects list fetched successfully | ${getLogIdentifiers(req)}`);
    // Send back the standardized pagination format
    return sendProjectsListFetchedSuccess(res, result.projects, result.pagination);
  } catch (error) {
    logWithTime(`❌ [listProjectsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listProjectsController };
