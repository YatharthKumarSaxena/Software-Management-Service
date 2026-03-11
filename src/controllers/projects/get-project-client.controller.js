// controllers/projects/get-project-client.controller.js

const { getProjectClientService } = require("@services/projects/get-project.service");
const { sendProjectFetchedSuccess } = require("@/responses/success/project.response");
const {
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Get Single Project – Client View
 *
 * @route  GET /software-management-service/api/v1/admin/get-project-client/:projectId
 * @access Private – All admin roles (serves client-facing data)
 *
 * Returns only the publicly safe fields:
 *   _id, name, description, problemStatement, goal, version,
 *   projectStatus, currentPhase, createdAt, updatedAt, completedAt
 *
 * Deleted projects are treated as not found.
 *
 * @returns {200} Project details (restricted fields)
 * @returns {400} Invalid projectId
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const getProjectClientController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai
    const projectId = project._id.toString();

    const result = await getProjectClientService(projectId);

    if (!result.success) {
      if (result.message === "Project not found") {
        logWithTime(`❌ [getProjectClientController] Project not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Project");
      }
      logWithTime(`❌ [getProjectClientController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getProjectClientController] Project fetched successfully | ${getLogIdentifiers(req)}`);
    return sendProjectFetchedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [getProjectClientController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getProjectClientController };
