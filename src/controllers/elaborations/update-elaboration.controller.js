// controllers/elaborations/update-elaboration.controller.js

const { updateElaborationService } = require("../../services/elaborations/update-elaboration.service");
const {
  sendElaborationUpdatedSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND } = require("@configs/http-status.config");

const updateElaborationController = async (req, res) => {
  const { projectId } = req.params;
  const { allowParallelMeetings, workflowMode, phaseStatus } = req.body;

  const result = await updateElaborationService({
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
      const resource = result.message.includes("Project") ? "Project" : "Elaboration";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendElaborationUpdatedSuccess(res, result.elaboration, result.message);
};

module.exports = { updateElaborationController };
