// controllers/negotiations/update-negotiation.controller.js

const { updateNegotiationService } = require("../../services/negotiations/update-negotiation.service");
const {
  sendNegotiationUpdatedSuccess,
} = require("../../responses/success/negotiation.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND } = require("@configs/http-status.config");

const updateNegotiationController = async (req, res) => {
  const { projectId } = req.params;
  const { allowParallelMeetings, workflowMode, phaseStatus } = req.body;

  const result = await updateNegotiationService({
    projectId,
    allowParallelMeetings: typeof allowParallelMeetings === 'boolean' ? allowParallelMeetings : undefined,
    workflowMode: typeof workflowMode === 'string' ? workflowMode : undefined,
    phaseStatus: typeof phaseStatus === 'string' ? phaseStatus : undefined,
    updatedBy: req.admin.adminId,
    auditContext: {
      user: req.admin,
      device: req.device,
      requestId: req.requestId
    },
  });

  if (!result.success) {
    if (result.errorCode === CONFLICT) {
      return throwConflictError(res, result.message);
    }
    if (result.errorCode === NOT_FOUND) {
      const resource = result.message.includes("Project") ? "Project" : "Negotiation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendNegotiationUpdatedSuccess(res, result.negotiation, result.message);
};

module.exports = { updateNegotiationController };
