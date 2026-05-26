// controllers/negotiations/delete-negotiation.controller.js

const { deleteNegotiationService } = require("../../services/negotiations/delete-negotiation.service");
const {
  sendNegotiationDeletedSuccess,
} = require("../../responses/success/negotiation.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const deleteNegotiationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { deletionReasonType, deletionReasonDescription } = req.body;

    logWithTime(
      `📍 [deleteNegotiationController] Deleting negotiation for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    const result = await deleteNegotiationService({
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
        const resource = result.message.includes("Project") ? "Project" : "Negotiation";
        logWithTime(
          `⚠️ [deleteNegotiationController] Resource not found: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwDBResourceNotFoundError(res, resource);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `⚠️ [deleteNegotiationController] Deletion blocked due to conflict: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(
        `⚠️ [deleteNegotiationController] Deletion blocked: ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(
      `✅ [deleteNegotiationController] Negotiation deleted successfully | ${getLogIdentifiers(req)}`
    );
    return sendNegotiationDeletedSuccess(res, result.negotiation);

  } catch (error) {
    logWithTime(
      `❌ [deleteNegotiationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteNegotiationController };
