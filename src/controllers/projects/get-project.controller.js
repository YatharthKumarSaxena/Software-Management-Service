// controllers/projects/get-project-admin.controller.js

const { getProjectAdminService, getProjectClientService } = require("@services/projects/get-project.service");
const { sendProjectFetchedSuccess } = require("@/responses/success/project.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Get Single Project – Admin View
 *
 * @route  GET /software-management-service/api/v1/admin/get-project/:projectId
 * @access Private – All admin roles
 *
 * Returns the full project document (all fields), including audit trail,
 * reason fields, archive/deletion flags, etc.
 *
 * @returns {200} Project details
 * @returns {400} Invalid projectId
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const getProjectController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai
    const authorizationContext = req.authorizationContext || {};

    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";
    const result = shouldUseRestrictedView
      ? await getProjectClientService(project, req.stakeholder)
      : await getProjectAdminService(project);

    if (!result.success) {
      logWithTime(`❌ [getProjectAdminController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getProjectAdminController] Project fetched successfully | ${getLogIdentifiers(req)}`);
    return sendProjectFetchedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [getProjectAdminController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getProjectController };
