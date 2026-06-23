// controllers/specifications/update-specification.controller.js

const { updateSpecificationService } = require("../../services/specifications/update-specification.service");
const {
  sendSpecificationUpdatedSuccess,
} = require("../../responses/success/specification.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND } = require("@configs/http-status.config");

const updateSpecificationController = async (req, res) => {
  const { projectId } = req.params;
  const { allowParallelMeetings, workflowMode, phaseStatus } = req.body;

  const result = await updateSpecificationService({
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
      const resource = result.message.includes("Project") ? "Project" : "Specification";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendSpecificationUpdatedSuccess(res, result.specification, result.message);
};

module.exports = { updateSpecificationController };
