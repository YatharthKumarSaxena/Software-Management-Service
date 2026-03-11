// controllers/projects/resume-project.controller.js

const { resumeProjectService } = require("@services/projects/resume-project.service");
const { sendProjectResumedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Resume Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/resume-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId              - MongoDB ObjectId of the project
 * @body   {string} resumeReasonType       - Enum: why the project is being resumed
 * @body   {string} [resumeReasonDescription] - Optional free-text elaboration
 *
 * Blocked if: project is deleted, or projectStatus === COMPLETED.
 * Allowed from statuses: ON_HOLD | ABORTED
 *
 * @returns {200} Project resumed successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const resumeProjectController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai
    const projectId = project._id.toString();

    const { resumeReasonType, resumeReasonDescription } = req.body;
    const resumedBy = req.admin.adminId;

    const result = await resumeProjectService(projectId, {
      resumeReasonType,
      resumeReasonDescription,
      resumedBy,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Project not found") {
        logWithTime(`❌ [resumeProjectController] Project not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Project");
      }
      if (
        result.message === "Project is deleted" ||
        result.message === "Project is already completed" ||
        result.message === "Only an ON_HOLD or ABORTED project can be resumed"
      ) {
        logWithTime(`❌ [resumeProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.currentStatus
          ? `Current project status is: ${result.currentStatus}`
          : result.message
        );
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [resumeProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [resumeProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [resumeProjectController] Project resumed successfully | ${getLogIdentifiers(req)}`);
    return sendProjectResumedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [resumeProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { resumeProjectController };
