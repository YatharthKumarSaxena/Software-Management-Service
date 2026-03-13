// controllers/projects/on-hold-project.controller.js

const { onHoldProjectService } = require("@services/projects/on-hold-project.service");
const { sendProjectOnHoldSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Put Project On Hold
 *
 * @route  PATCH /software-management-service/api/v1/projects/on-hold/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId                 - MongoDB ObjectId of the project
 * @body   {string} onHoldReasonType          - Enum: why the project is being put on hold
 * @body   {string} [onHoldReasonDescription] - Optional free-text elaboration
 *
 * Blocked if: project is deleted, or status is anything other than ACTIVE.
 * Only ACTIVE projects can be put on hold.
 *
 * @returns {200} Project put on hold successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const onHoldProjectController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai

    const { onHoldReasonType, onHoldReasonDescription } = req.body;
    const onHoldBy = req.admin.adminId;

    const result = await onHoldProjectService(project, {
      onHoldReasonType,
      onHoldReasonDescription,
      onHoldBy,
      auditContext: {
        admin:     req.admin,
        device:    req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Only an ACTIVE project can be put on hold") {
        logWithTime(`❌ [onHoldProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(
          res,
          result.message,
          result.currentStatus
            ? `Current project status is: ${result.currentStatus}`
            : result.message
        );
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [onHoldProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [onHoldProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [onHoldProjectController] Project put on hold successfully | ${getLogIdentifiers(req)}`);
    return sendProjectOnHoldSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [onHoldProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { onHoldProjectController };
