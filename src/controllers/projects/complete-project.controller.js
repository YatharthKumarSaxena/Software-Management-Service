// controllers/projects/complete-project.controller.js

const { completeProjectService } = require("@services/projects/complete-project.service");
const { sendProjectCompletedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Complete Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/complete-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId - MongoDB ObjectId of the project
 *
 * No request body required. projectId in params is the only input.
 * After completion NO further operations are permitted on the project.
 *
 * Blocked if: project is deleted, or already COMPLETED.
 * Allowed from status: ACTIVE only.
 *
 * @returns {200} Project completed successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const completeProjectController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai

    const completedBy = req.admin.adminId;

    const result = await completeProjectService(project, {
      completedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (
        result.message === "Project is already completed" ||
        result.message === "Only an ACTIVE project can be completed"
      ) {
        logWithTime(`❌ [completeProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.currentStatus
          ? `Current project status is: ${result.currentStatus}`
          : result.message
        );
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [completeProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [completeProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [completeProjectController] Project completed successfully | ${getLogIdentifiers(req)}`);
    return sendProjectCompletedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [completeProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { completeProjectController };
