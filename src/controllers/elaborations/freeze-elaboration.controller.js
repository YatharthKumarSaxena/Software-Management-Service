// controllers/elaborations/freeze-elaboration.controller.js

const { freezeElaborationService } = require("../../services/elaborations/freeze-elaboration.service");
const {
  sendElaborationFrozenSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { NOT_FOUND } = require("@configs/http-status.config");

const freezeElaborationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await freezeElaborationService({
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
      const resource = result.message.includes("Project") ? "Project" : "Elaboration";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendElaborationFrozenSuccess(res, result.elaboration);
};

module.exports = { freezeElaborationController };
