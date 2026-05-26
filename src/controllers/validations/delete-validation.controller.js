// controllers/validations/delete-validation.controller.js

const { deleteValidationService } = require("../../services/validations/delete-validation.service");
const {
  sendValidationDeletedSuccess,
} = require("../../responses/success/validation.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const deleteValidationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { deletionReasonType, deletionReasonDescription } = req.body;

    logWithTime(
      `📍 [deleteValidationController] Deleting validation for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    const result = await deleteValidationService({
      projectId,
      deletionReasonType,
      deletionReasonDescription,
      deletedBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      },
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        const resource = result.message.includes("Project") ? "Project" : "Validation";
        logWithTime(
          `⚠️ [deleteValidationController] Resource not found: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwDBResourceNotFoundError(res, resource);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `⚠️ [deleteValidationController] Deletion blocked due to conflict: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(
        `⚠️ [deleteValidationController] Deletion blocked: ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(
      `✅ [deleteValidationController] Validation deleted successfully | ${getLogIdentifiers(req)}`
    );
    return sendValidationDeletedSuccess(res, result.validation);

  } catch (error) {
    logWithTime(
      `❌ [deleteValidationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteValidationController };
