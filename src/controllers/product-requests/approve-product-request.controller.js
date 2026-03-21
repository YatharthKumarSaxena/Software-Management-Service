// controllers/product-requests/approve-product-request.controller.js

const { approveProductRequestService } = require("@services/product-requests");
const { sendProductRequestApprovedSuccess } = require("@/responses/success/product-request.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST } = require("@configs/http-status.config");

/**
 * Controller: Approve Product Request
 *
 * @route  PATCH /software-management-service/api/v1/admin/product-requests/:productRequestId/approve
 * @access Private – Admin Only
 *
 * @params {string} productRequestId    - Product request ID
 * @body   {string} reasonType           - Reason type for approval (compulsory)
 * @body   {string} [reasonDescription] - Optional description for approval
 *
 * @returns {200} Product request approved successfully
 * @returns {400} Bad request / invalid state
 * @returns {500} Internal server error
 */
const approveProductRequestController = async (req, res) => {
  try {
    const productRequest = req.productRequest;
    const { reasonType, reasonDescription } = req.body;
    const approvedBy = req.admin.adminId;

    // ── Call service ────────────────────────────────────────────────────
    const result = await approveProductRequestService(productRequest, {
      approvedBy,
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
        logWithTime(`❌ [approveProductRequestController] Bad request: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.description);
      }

      logWithTime(`❌ [approveProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [approveProductRequestController] Product request approved successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestApprovedSuccess(res, result.data.productRequest);

  } catch (error) {
    logWithTime(`❌ [approveProductRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { approveProductRequestController };
