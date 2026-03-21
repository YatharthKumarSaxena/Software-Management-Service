// controllers/product-requests/update-product-request.controller.js

const { updateProductRequestService } = require("@services/product-requests");
const { sendProductRequestUpdatedSuccess } = require("@/responses/success/product-request.response");
const {
  throwBadRequestError,
  throwAccessDeniedError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, FORBIDDEN, OK } = require("@configs/http-status.config");

/**
 * Controller: Update Product Request
 *
 * @route  PATCH /software-management-service/api/v1/product-requests/:productRequestId
 * @access Private – Stakeholder / Client (if PENDING)
 *
 * @params {string} productRequestId - Product request ID
 * @body   {Object} updateData       - Fields to update
 *
 * @returns {200} Product request updated successfully
 * @returns {400} Bad request / invalid state
 * @returns {403} Forbidden to update
 * @returns {500} Internal server error
 */
const updateProductRequestController = async (req, res) => {
  try {
    const productRequest = req.productRequest;
    const updateData = req.body;

    // Determine user type from request (admin or client)
    const client = req.client;
    const userId = client.clientId;

    // ── Call service ────────────────────────────────────────────────────
    const result = await updateProductRequestService(productRequest, {
      updateData,
      updatedBy: userId,
      auditContext: {
        user: client,
        device: req.device,
        requestId: req.requestId,
      },
    });

    // ── Handle response based on errorCode ──────────────────────────────
    if (!result.isSuccess) {
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(`❌ [updateProductRequestController] Bad request: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.description);
      }

      if (result.errorCode === FORBIDDEN) {
        logWithTime(`❌ [updateProductRequestController] Forbidden: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwAccessDeniedError(res, result.description);
      }

      logWithTime(`❌ [updateProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    // ── Handle success with "No changes detected" message ──────────────────
    if (result.message === "No changes detected") {
      logWithTime(`ℹ️ [updateProductRequestController] No changes detected | ${getLogIdentifiers(req)}`);
      return res.status(OK).json({
        success: true,
        message: "No changes detected. Product request remains unchanged.",
        productRequest: result.data.productRequest
      });
    }

    logWithTime(`✅ [updateProductRequestController] Product request updated successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestUpdatedSuccess(res, result.data.productRequest);

  } catch (error) {
    logWithTime(`❌ [updateProductRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateProductRequestController };
