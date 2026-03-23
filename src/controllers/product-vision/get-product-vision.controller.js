// controllers/product-vision/get-product-vision.controller.js

const {
  getProductVisionAdminService,
  getProductVisionClientService,
} = require("@services/product-vision/get-product-vision.service");
const { sendProductVisionFetchedSuccess } = require("@/responses/success/product-vision.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

const getProductVisionController = async (req, res) => {
  try {
    const inception = req.inception;
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    const result = shouldUseRestrictedView
      ? await getProductVisionClientService(inception)
      : await getProductVisionAdminService(inception);

    if (!result.success) {
      logWithTime(`❌ [getProductVisionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getProductVisionController] Product vision fetched successfully | ${getLogIdentifiers(req)}`);
    return sendProductVisionFetchedSuccess(res, result.inception);

  } catch (error) {
    logWithTime(`❌ [getProductVisionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getProductVisionController };
