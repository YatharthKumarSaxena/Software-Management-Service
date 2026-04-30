// controllers/negotiations/delete-negotiation.controller.js

const { deleteNegotiationService } = require("../../services/negotiations/delete-negotiation.service");
const {
  sendNegotiationDeletedSuccess,
} = require("../../responses/success/negotiation.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteNegotiationController = async (req, res) => {
  const { projectId } = req.params;
  const { deletionReasonType, deletionReasonDescription } = req.body;

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
      return throwDBResourceNotFoundError(res, resource);
    }
    if (result.errorCode === CONFLICT) {
      return throwConflictError(res, result.message);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendNegotiationDeletedSuccess(res, result.negotiation);
};

module.exports = { deleteNegotiationController };
