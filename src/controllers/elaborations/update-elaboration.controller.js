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
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const { OK } = require("@configs/http-status.config");
const { logWithTime } = require("@/utils/time-stamps.util");

const updateElaborationController = async (req, res) => {
  const { projectId } = req.params;
  const { allowParallelMeetings, requirementGovernanceMode, workflowMode } = req.body;

  const result = await updateElaborationService({
    projectId,
    allowParallelMeetings: typeof allowParallelMeetings === 'boolean' ? allowParallelMeetings : false,
    requirementGovernanceMode: typeof requirementGovernanceMode === 'string' ? requirementGovernanceMode : null,
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
      const resource = result.message.includes("Project") ? "Project" : "Elaboration";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  if (result.message === "No changes detected") {
    logWithTime(`⚠️ No changes detected for Elaboration update in project ${projectId}`);
    return res.status(OK).json({
      success: true,
      message: "No changes detected. Elaboration remains unchanged."
    });
  }

  return sendElaborationUpdatedSuccess(res, result.elaboration);
};

module.exports = { updateElaborationController };
