// controllers/specifications/delete-specification.controller.js

const { deleteSpecificationService } = require("../../services/specifications/delete-specification.service");
const {
  sendSpecificationDeletedSuccess,
} = require("../../responses/success/specification.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const deleteSpecificationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { deletionReasonType, deletionReasonDescription } = req.body;

    logWithTime(
      `📍 [deleteSpecificationController] Deleting specification for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    const result = await deleteSpecificationService({
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
        const resource = result.message.includes("Project") ? "Project" : "Specification";
        logWithTime(
          `⚠️ [deleteSpecificationController] Resource not found: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwDBResourceNotFoundError(res, resource);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `⚠️ [deleteSpecificationController] Deletion blocked due to conflict: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(
        `⚠️ [deleteSpecificationController] Deletion blocked: ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(
      `✅ [deleteSpecificationController] Specification deleted successfully | ${getLogIdentifiers(req)}`
    );
    return sendSpecificationDeletedSuccess(res, result.specification);

  } catch (error) {
    logWithTime(
      `❌ [deleteSpecificationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteSpecificationController };
