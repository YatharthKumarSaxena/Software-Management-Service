// controllers/product-requests/cancel-product-request.controller.js

const { cancelProductRequestService } = require("@services/product-requests");
const { sendProductRequestCancelledSuccess } = require("@/responses/success/product-request.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST } = require("@configs/http-status.config");

/**
 * Controller: Cancel Product Request
 *
 * @route  PATCH /software-management-service/api/v1/product-requests/cancel/:productRequestId
 * @access Private – Admin / Client (if they created it)
 *
 * @params {string} productRequestId   - Product request ID
 * @body   {string} reasonType          - Reason type for cancellation (compulsory)
 * @body   {string} reasonDescription  - Cancellation description (compulsory)
 *
 * @returns {200} Product request cancelled successfully
 * @returns {400} Bad request / invalid state
 * @returns {500} Internal server error
 */
const cancelProductRequestController = async (req, res) => {
  try {
    const productRequest = req.productRequest;
    const cancelledBy = req.client.clientId;

    // ── Call service ────────────────────────────────────────────────────
    const result = await cancelProductRequestService(productRequest, {
      cancelledBy,
      auditContext: {
        user: req.client || null,
        device: req.device,
        requestId: req.requestId,
      },
    });

    // ── Handle response based on errorCode ──────────────────────────────
    if (!result.isSuccess) {
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(`❌ [cancelProductRequestController] Bad request: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.description);
      }

      logWithTime(`❌ [cancelProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [cancelProductRequestController] Product request cancelled successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestCancelledSuccess(res, result.data.productRequest);

  } catch (error) {
    logWithTime(`❌ [cancelProductRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { cancelProductRequestController };
