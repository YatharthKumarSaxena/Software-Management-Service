// controllers/specifications/freeze-specification.controller.js

const { freezeSpecificationService } = require("../../services/specifications/freeze-specification.service");
const {
  sendSpecificationFrozenSuccess,
} = require("../../responses/success/specification.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const freezeSpecificationController = async (req, res) => {
  try {
    const { specification } = req;

    const result = await freezeSpecificationService(
      specification,
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

    logWithTime(`✅ [freezeSpecificationController] Specification frozen successfully | ${getLogIdentifiers(req)}`);
    return sendSpecificationFrozenSuccess(res, result.message);
  } catch (error) {
    logWithTime(`❌ [freezeSpecificationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { freezeSpecificationController };
