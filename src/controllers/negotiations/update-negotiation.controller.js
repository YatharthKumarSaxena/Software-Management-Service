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
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const { OK } = require("@configs/http-status.config");
const { logWithTime } = require("@/utils/time-stamps.util");

const updateNegotiationController = async (req, res) => {
  const { projectId } = req.params;
  const { allowParallelMeetings, workflowMode } = req.body;

  const result = await updateNegotiationService({
    projectId,
    allowParallelMeetings: typeof allowParallelMeetings === 'boolean' ? allowParallelMeetings : false,
    workflowMode: typeof workflowMode === 'string' ? workflowMode : null,
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

  if (result.message === "No changes detected") {
    logWithTime(`⚠️ No changes detected for Negotiation update in project ${projectId}`);
    return res.status(OK).json({
      success: true,
      message: "No changes detected. Negotiation remains unchanged."
    });
  }

  return sendNegotiationUpdatedSuccess(res, result.negotiation);
};

module.exports = { updateNegotiationController };
