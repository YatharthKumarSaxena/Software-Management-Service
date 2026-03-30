// controllers/validations/freeze-validation.controller.js

const { freezeValidationService } = require("../../services/validations/freeze-validation.service");
const {
  sendValidationFrozenSuccess,
} = require("../../responses/success/validation.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeValidationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await freezeValidationService({
    projectId,
    frozenBy: req.admin.adminId,
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
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendValidationFrozenSuccess(res, result.validation);
};

module.exports = { freezeValidationController };
