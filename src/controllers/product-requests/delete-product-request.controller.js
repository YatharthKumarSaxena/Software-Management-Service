// controllers/product-requests/delete-product-request.controller.js

const { deleteProductRequestService } = require("@services/product-requests");
const { sendProductRequestDeletedSuccess } = require("@/responses/success/product-request.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST } = require("@configs/http-status.config");

/**
 * Controller: Delete Product Request (Soft Delete)
 *
 * @route  DELETE /software-management-service/api/v1/product-requests/:productRequestId
 * @access Private – Admin / Client
 *
 * @params {string} productRequestId  - Product request ID
 * @body   {string} [deletionReason]  - For admin deletion, reason is compulsory
 *
 * @returns {200} Product request deleted successfully
 * @returns {400} Bad request / missing reason
 * @returns {500} Internal server error
 */
const deleteProductRequestController = async (req, res) => {
  try {
    const productRequest = req.productRequest;
    const { deletionReason } = req.body;

    // Determine user type from request
    const userId = req.admin.adminId;

    // ── Call service ────────────────────────────────────────────────────
    const result = await deleteProductRequestService(productRequest, {
      deletedBy: userId,
      deletionReason,
      auditContext: {
        user: req.admin || null,
        device: req.device,
        requestId: req.requestId,
      },
    });

    // ── Handle response based on errorCode ──────────────────────────────
    if (!result.isSuccess) {
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(`❌ [deleteProductRequestController] Bad request: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.description);
      }

      logWithTime(`❌ [deleteProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [deleteProductRequestController] Product request deleted successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestDeletedSuccess(res);

  } catch (error) {
    logWithTime(`❌ [deleteProductRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteProductRequestController };
