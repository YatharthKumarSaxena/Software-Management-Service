// controllers/product-vision/create-product-vision.controller.js

const { createProductVisionService } = require("@services/product-vision/create-product-vision.service");
const { sendProductVisionCreatedSuccess } = require("@/responses/success/product-vision.response");

const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

const createProductVisionController = async (req, res) => {
  try {
    const { productVision } = req.body;
    const createdBy = req.admin.adminId;

    const inception = req.inception;

    // ── Call service ──────────────────────────────────────
    const result = await createProductVisionService({
      inception,
      productVision,
      createdBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Product vision already exists") {
        logWithTime(`❌ [createProductVisionController] Product vision already exists | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [createProductVisionController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [createProductVisionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [createProductVisionController] Product vision created successfully | ${getLogIdentifiers(req)}`);
    return sendProductVisionCreatedSuccess(res, result.inception);

  } catch (error) {
    logWithTime(`❌ [createProductVisionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createProductVisionController };
