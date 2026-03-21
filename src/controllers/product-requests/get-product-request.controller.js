// controllers/product-requests/get-product-request.controller.js

const { getProductRequestService } = require("@services/product-requests");
const { sendProductRequestRetrievedSuccess } = require("@/responses/success/product-request.response");
const {
  throwDBResourceNotFoundError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND } = require("@configs/http-status.config");

/**
 * Controller: Get Product Request
 *
 * @route  GET /software-management-service/api/v1/product-requests/:productRequestId
 * @access Private – Admin / Client (own requests only)
 *
 * @params {string} productRequestId - Product request ID
 *
 * @returns {200} Product request retrieved successfully
 * @returns {404} Product request not found
 * @returns {500} Internal server error
 */
const getProductRequestController = async (req, res) => {
  try {
    const productRequest = req.productRequest;

    // Determine user type and extract proper client MongoDB _id
    let isClient = false;
    let clientMongoId = null;

    if (req.admin) {
      // Admin - no client restriction
      isClient = false;
    } else if (req.client) {
      clientMongoId = req.client._id;
      isClient = true;
    }

    // ── Call service ────────────────────────────────────────────────────
    const result = await getProductRequestService(productRequest, {
      clientMongoId,
      isClient
    });

    // ── Handle response based on errorCode ──────────────────────────────
    if (!result.isSuccess) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [getProductRequestController] Product request not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Product Request");
      }

      logWithTime(`❌ [getProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [getProductRequestController] Product request retrieved successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestRetrievedSuccess(res, result.data.productRequest);

  } catch (error) {
    logWithTime(`❌ [getProductRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getProductRequestController };
