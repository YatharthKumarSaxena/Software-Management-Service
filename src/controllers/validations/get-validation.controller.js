// controllers/validations/get-validation.controller.js

const { getValidationService } = require("../../services/validations/get-validation.service");
const {
  sendValidationRetrievedSuccess,
} = require("../../responses/success/validation.response");
const {
  throwInternalServerError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const getValidationController = async (req, res) => {
  const validation = req.validation; // Set by previous middleware

  const result = await getValidationService(validation);

  if (!result.success) {
    return throwInternalServerError(res, new Error(result.message));
  }

  logWithTime(`✅ Validation retrieved successfully for validationId: ${validation.validationId}`);
  return sendValidationRetrievedSuccess(res, result.validation);
};

module.exports = { getValidationController };
