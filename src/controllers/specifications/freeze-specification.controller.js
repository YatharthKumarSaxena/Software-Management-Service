// controllers/specifications/freeze-specification.controller.js

const { freezeSpecificationService } = require("../../services/specifications/freeze-specification.service");
const {
  sendSpecificationFrozenSuccess,
} = require("../../responses/success/specification.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { NOT_FOUND } = require("@configs/http-status.config");

const freezeSpecificationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await freezeSpecificationService({
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
      const resource = result.message.includes("Project") ? "Project" : "Specification";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendSpecificationFrozenSuccess(res, result.specification);
};

module.exports = { freezeSpecificationController };
