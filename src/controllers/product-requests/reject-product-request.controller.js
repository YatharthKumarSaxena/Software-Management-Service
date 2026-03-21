// controllers/product-requests/reject-product-request.controller.js

const { rejectProductRequestService } = require("@services/product-requests");
const { sendProductRequestRejectedSuccess } = require("@/responses/success/product-request.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST } = require("@configs/http-status.config");

/**
 * Controller: Reject Product Request
 *
 * @route  PATCH /software-management-service/api/v1/admin/product-requests/:productRequestId/reject
 * @access Private – Admin Only
 *
 * @params {string} productRequestId   - Product request ID
 * @body   {string} reasonType          - Reason type for rejection (compulsory)
 * @body   {string} reasonDescription  - Rejection description (compulsory)
 *
 * @returns {200} Product request rejected successfully
 * @returns {400} Bad request / invalid state
 * @returns {500} Internal server error
 */
const rejectProductRequestController = async (req, res) => {
  try {
    const productRequest = req.productRequest;
    const { reasonType, reasonDescription } = req.body;
    const rejectedBy = req.admin.adminId;

    // ── Call service ────────────────────────────────────────────────────
    const result = await rejectProductRequestService(productRequest, {
      rejectedBy,
      reasonType,
      reasonDescription,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    // ── Handle response based on errorCode ──────────────────────────────
    if (!result.isSuccess) {
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(`❌ [rejectProductRequestController] Bad request: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.description);
      }

      logWithTime(`❌ [rejectProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [rejectProductRequestController] Product request rejected successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestRejectedSuccess(res, result.data.productRequest);

  } catch (error) {
    logWithTime(`❌ [rejectProductRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { rejectProductRequestController };
