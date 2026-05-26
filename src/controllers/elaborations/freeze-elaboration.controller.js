// controllers/elaborations/freeze-elaboration.controller.js

const { freezeElaborationService } = require("../../services/elaborations/freeze-elaboration.service");
const {
  sendElaborationFrozenSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const freezeElaborationController = async (req, res) => {
  try { 
    const { elaboration } = req;

    const result = await freezeElaborationService(
      elaboration,
      {
        frozenBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    if (!result.success) {
      return throwSpecificInternalServerError(res, result.message);
    }
    logWithTime(`✅ [freezeElaborationController] Elaboration frozen successfully | ${getLogIdentifiers(req)}`);
    return sendElaborationFrozenSuccess(res, result.message);
  } catch (error) {
    logWithTime(`❌ [freezeElaborationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, "An error occurred while freezing the elaboration phase.");
  }
};

module.exports = { freezeElaborationController };
