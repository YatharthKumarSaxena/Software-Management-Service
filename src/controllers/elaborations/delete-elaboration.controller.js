// controllers/elaborations/delete-elaboration.controller.js

const { deleteElaborationService } = require("../../services/elaborations/delete-elaboration.service");
const {
  sendElaborationDeletedSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const deleteElaborationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { deletionReasonType, deletionReasonDescription } = req.body;

    logWithTime(
      `📍 [deleteElaborationController] Deleting elaboration for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    const result = await deleteElaborationService({
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
        const resource = result.message.includes("Project") ? "Project" : "Elaboration";
        logWithTime(
          `⚠️ [deleteElaborationController] Resource not found: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwDBResourceNotFoundError(res, resource);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `⚠️ [deleteElaborationController] Deletion blocked due to conflict: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(
        `⚠️ [deleteElaborationController] Deletion blocked: ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(
      `✅ [deleteElaborationController] Elaboration deleted successfully | ${getLogIdentifiers(req)}`
    );
    return sendElaborationDeletedSuccess(res, result.elaboration);

  } catch (error) {
    logWithTime(
      `❌ [deleteElaborationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteElaborationController };
