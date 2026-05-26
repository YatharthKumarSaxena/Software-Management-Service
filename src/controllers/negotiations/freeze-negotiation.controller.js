// controllers/negotiations/freeze-negotiation.controller.js

const { freezeNegotiationService } = require("../../services/negotiations/freeze-negotiation.service");
const {
  sendNegotiationFrozenSuccess,
} = require("../../responses/success/negotiation.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const freezeNegotiationController = async (req, res) => {
  try {
    const { negotiation } = req;

    const result = await freezeNegotiationService(
      negotiation,
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

    logWithTime(`✅ [freezeNegotiationController] Negotiation frozen successfully | ${getLogIdentifiers(req)}`);
    return sendNegotiationFrozenSuccess(res, result.message);
  } catch (error) {
    logWithTime(`❌ [freezeNegotiationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { freezeNegotiationController };
