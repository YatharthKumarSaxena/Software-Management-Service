// controllers/projects/archive-project.controller.js

const { archiveProjectService } = require("@services/projects/archive-project.service");
const { sendProjectArchivedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Archive Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/archive-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId - MongoDB ObjectId of the project
 *
 * No request body required.
 * Only COMPLETED projects can be archived.
 * Blocked if: project is deleted, already archived, or status !== COMPLETED.
 *
 * @returns {200} Project archived successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const archiveProjectController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai
    const projectId = project._id.toString();

    const archivedBy = req.admin.adminId;

    const result = await archiveProjectService(projectId, {
      archivedBy,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Project not found") {
        logWithTime(`❌ [archiveProjectController] Project not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Project");
      }
      if (
        result.message === "Project is deleted" ||
        result.message === "Project is already archived" ||
        result.message === "Only a COMPLETED project can be archived"
      ) {
        logWithTime(`❌ [archiveProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.currentStatus
          ? `Current project status is: ${result.currentStatus}`
          : result.message
        );
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [archiveProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [archiveProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [archiveProjectController] Project archived successfully | ${getLogIdentifiers(req)}`);
    return sendProjectArchivedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [archiveProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { archiveProjectController };
