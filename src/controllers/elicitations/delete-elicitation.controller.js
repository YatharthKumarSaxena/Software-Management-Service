// controllers/elicitations/delete-elicitation.controller.js

const { elicitationServices } = require("@services/elicitations");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
} = require("@/responses/common/error-handler.response");
const { sendElicitationDeletedSuccess } = require("@/responses/success/elicitation.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const deleteElicitationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { deletionReasonType, deletionReasonDescription } = req.body;

    logWithTime(
      `📍 [deleteElicitationController] Deleting elicitation for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    const result = await elicitationServices.deleteElicitationService({
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
        const resource = result.message.includes("Project") ? "Project" : "Elicitation";
        logWithTime(
          `⚠️ [deleteElicitationController] Resource not found: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwDBResourceNotFoundError(res, resource);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `⚠️ [deleteElicitationController] Deletion blocked due to conflict: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(
        `⚠️ [deleteElicitationController] Deletion blocked: ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(
      `✅ [deleteElicitationController] Elicitation deleted successfully | ${getLogIdentifiers(req)}`
    );
    return sendElicitationDeletedSuccess(res, result.elicitation);

  } catch (error) {
    logWithTime(
      `❌ [deleteElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteElicitationController };
