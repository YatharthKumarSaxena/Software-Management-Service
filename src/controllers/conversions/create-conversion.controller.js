// controllers/conversions/create-conversion.controller.js

const { createConversionService } = require("@services/conversions/create-conversion.service");
const { sendConversionCreatedSuccess } = require("@/responses/success/conversion.response");

const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

const createConversionController = async (req, res) => {
  try {
    const {
      workflowId,
      sourceEntityId,
      sourceCollection,
      targetEntityId,
      targetCollection,
      conversionType
    } = req.body;

    const project = req.project;

    // ── Call service ──────────────────────────────────────
    const result = await createConversionService({
      workflowId,
      projectId: project._id.toString(),
      sourceEntityId,
      sourceCollection,
      targetEntityId,
      targetCollection,
      conversionType,
      auditContext: {
        user: req.admin || req.client,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      // Conflict scenarios (e.g. source entity already converted in a different workflow)
      if (result.message.includes("already been converted")) {
        logWithTime(`❌ [createConversionController] Conflict | ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }

      // Internal errors
      if (result.message === "Internal server error" || result.message.includes("Unsupported collections")) {
        logWithTime(`❌ [createConversionController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwSpecificInternalServerError(res, result.message);
      }

      // All other validation failures are Bad Requests
      logWithTime(`❌ [createConversionController] Validation error: ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message, result.error);
    }

    logWithTime(`✅ [createConversionController] Conversion created successfully | ${getLogIdentifiers(req)}`);
    return sendConversionCreatedSuccess(res, result.conversion);

  } catch (error) {
    logWithTime(`❌ [createConversionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createConversionController };
