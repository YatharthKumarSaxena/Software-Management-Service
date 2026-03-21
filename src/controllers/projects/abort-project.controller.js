// controllers/projects/abort-project.controller.js

const { abortProjectService } = require("@services/projects/abort-project.service");
const { sendProjectAbortedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Abort Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/abort-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId            - MongoDB ObjectId of the project
 * @body   {string} abortReasonType      - Enum: why the project is being aborted
 * @body   {string} [abortReasonDescription] - Optional free-text elaboration
 *
 * Blocked if: project is deleted, already COMPLETED, or already ABORTED.
 * Allowed from statuses: DRAFT | ACTIVE | ON_HOLD
 *
 * @returns {200} Project aborted successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */

const abortProjectController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai

    const { abortReasonType, abortReasonDescription } = req.body;
    const abortedBy = req.admin.adminId;

    const result = await abortProjectService(project, {
      abortReasonType,
      abortReasonDescription,
      abortedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (
        result.message === "Project is already completed" ||
        result.message === "Project is already aborted"
      ) {
        logWithTime(`❌ [abortProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.message);
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [abortProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [abortProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [abortProjectController] Project aborted successfully | ${getLogIdentifiers(req)}`);
    return sendProjectAbortedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [abortProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { abortProjectController };
