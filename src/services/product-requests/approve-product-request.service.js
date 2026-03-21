// services/product-requests/approve-product-request.service.js

const { ProductRequestModel } = require("@models/product-request.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { RequestStatus } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Approves a product request.
 * 
 * Only Admins can approve.
 * Status must be PENDING to approve.
 * reasonType is compulsory, reasonDescription is optional.
 *
 * @param {Object} productRequest - The product request document
 * @param {Object} params
 * @param {string} params.approvedBy        - Admin ID
 * @param {string} params.reasonType        - Type of approval reason (compulsory)
 * @param {string} [params.reasonDescription] - Optional description
 * @param {Object} params.auditContext
 *
 * @returns {Object} { errorCode, isSuccess: true, data } | { errorCode, isSuccess: false, description }
 */
const approveProductRequestService = async (productRequest, params) => {
  try {
    const { approvedBy, reasonType, reasonDescription, auditContext } = params;

    if (productRequest.status !== RequestStatus.PENDING) {
      logWithTime(`❌ [approveProductRequestService] Cannot approve non-pending request`);
      return {
        errorCode: BAD_REQUEST,
        isSuccess: false,
        description: "Only product requests in PENDING status can be approved"
      };
    }

    // ── Build update payload ──────────────────────────────────────────
    const updatePayload = {
      status: RequestStatus.APPROVED
    };

    const updatedProductRequest = await ProductRequestModel.findByIdAndUpdate(
      productRequest._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const description = reasonDescription
      ? `Product request '${productRequest.title}' (${productRequest._id}) approved by ${approvedBy}. ReasonType: ${reasonType}. Description: ${reasonDescription}`
      : `Product request '${productRequest.title}' (${productRequest._id}) approved by ${approvedBy}. ReasonType: ${reasonType}`;

    const { oldData, newData } = prepareAuditData(productRequest, updatedProductRequest);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.APPROVE_PRODUCT_REQUEST,
      description,
      { oldData, newData, adminActions: { targetId: productRequest._id } }
    );

    logWithTime(`✅ [approveProductRequestService] Product request approved successfully: ${productRequest._id}`);
    return {
      errorCode: OK,
      isSuccess: true,
      data: { productRequest: updatedProductRequest }
    };

  } catch (error) {
    logWithTime(`❌ [approveProductRequestService] Error: ${error.message}`);
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
      description: "Internal error while approving product request"
    };
  }
};

module.exports = { approveProductRequestService };
