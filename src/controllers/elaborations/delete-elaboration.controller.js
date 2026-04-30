// controllers/elaborations/delete-elaboration.controller.js

const { deleteElaborationService } = require("../../services/elaborations/delete-elaboration.service");
const {
  sendElaborationDeletedSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteElaborationController = async (req, res) => {
  const { projectId } = req.params;
  const { deletionReasonType, deletionReasonDescription } = req.body;

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
      return throwDBResourceNotFoundError(res, resource);
    }
    if (result.errorCode === CONFLICT) {
      return throwConflictError(res, result.message);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendElaborationDeletedSuccess(res, result.elaboration);
};

module.exports = { deleteElaborationController };
