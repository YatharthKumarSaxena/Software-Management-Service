// controllers/validations/delete-validation.controller.js

const { deleteValidationService } = require("../../services/validations/delete-validation.service");
const {
  sendValidationDeletedSuccess,
} = require("../../responses/success/validation.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteValidationController = async (req, res) => {
  const { projectId } = req.params;
  const { deletionReasonType, deletionReasonDescription } = req.body;

  const result = await deleteValidationService({
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
      const resource = result.message.includes("Project") ? "Project" : "Validation";
      return throwDBResourceNotFoundError(res, resource);
    }
    if (result.errorCode === CONFLICT) {
      return throwConflictError(res, result.message);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendValidationDeletedSuccess(res, result.validation);
};

module.exports = { deleteValidationController };
