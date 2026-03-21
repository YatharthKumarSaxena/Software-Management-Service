// services/product-requests/reject-product-request.service.js

const { ProductRequestModel } = require("@models/product-request.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { RequestStatus } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Rejects a product request.
 * 
 * Only Admins can reject.
 * Status must be PENDING to reject.
 * reasonType is compulsory, reasonDescription is also compulsory (required to explain rejection).
 *
 * @param {Object} productRequest - The product request document
 * @param {Object} params
 * @param {string} params.rejectedBy        - Admin ID
 * @param {string} params.reasonType        - Type of rejection reason (compulsory)
 * @param {string} params.reasonDescription - Rejection description (compulsory)
 * @param {Object} params.auditContext
 *
 * @returns {Object} { errorCode, isSuccess: true, data } | { errorCode, isSuccess: false, description }
 */
const rejectProductRequestService = async (productRequest, params) => {
  try {
    const { rejectedBy, reasonType, reasonDescription, auditContext } = params;

    if (productRequest.status !== RequestStatus.PENDING) {
      logWithTime(`❌ [rejectProductRequestService] Cannot reject non-pending request`);
      return {
        errorCode: BAD_REQUEST,
        isSuccess: false,
        description: "Only product requests in PENDING status can be rejected"
      };
    }

    // ── Build update payload ──────────────────────────────────────────
    const updatePayload = {
      status: RequestStatus.REJECTED
    };

    const updatedProductRequest = await ProductRequestModel.findByIdAndUpdate(
      productRequest._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const description = `Product request '${productRequest.title}' (${productRequest._id}) rejected by ${rejectedBy}. ReasonType: ${reasonType}. Description: ${reasonDescription}`;

    const { oldData, newData } = prepareAuditData(productRequest, updatedProductRequest);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REJECT_PRODUCT_REQUEST,
      description,
      { oldData, newData, adminActions: { targetId: productRequest._id } }
    );

    logWithTime(`✅ [rejectProductRequestService] Product request rejected successfully: ${productRequest._id}`);
    return {
      errorCode: OK,
      isSuccess: true,
      data: { productRequest: updatedProductRequest }
    };

  } catch (error) {
    logWithTime(`❌ [rejectProductRequestService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return {
        errorCode: BAD_REQUEST,
        isSuccess: false,
        description: "Validation error: " + error.message
      };
    }
    return {
      errorCode: INTERNAL_ERROR,
      isSuccess: false,
      description: "Internal error while rejecting product request"
    };
  }
};

module.exports = { rejectProductRequestService };
