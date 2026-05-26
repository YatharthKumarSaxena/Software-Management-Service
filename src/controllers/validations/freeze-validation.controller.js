// controllers/validations/freeze-validation.controller.js

const { freezeValidationService } = require("../../services/validations/freeze-validation.service");
const {
  sendValidationFrozenSuccess,
} = require("../../responses/success/validation.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const freezeValidationController = async (req, res) => {
  try {
    const { validation } = req;

    const result = await freezeValidationService(
      validation,
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
    logWithTime(`✅ [freezeValidationController] Validation frozen successfully | ${getLogIdentifiers(req)}`);
    return sendValidationFrozenSuccess(res, result.message);
  } catch (error) {
    logWithTime(`❌ [freezeValidationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { freezeValidationController };
