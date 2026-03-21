// services/product-requests/delete-product-request.service.js

const { ProductRequestModel } = require("@models/product-request.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Soft-deletes a product request (sets isDeleted = true).
 * 
 * Authorization:
 * - Admin: Can delete, reason is compulsory
 * - Client: Can delete their own requests
 * 
 * @param {Object} productRequest - The product request document
 * @param {Object} params
 * @param {string} params.deletedBy      - Admin/Client ID who is deleting
 * @param {string} [params.deletionReason] - For admin, this is compulsory (free-text description)
 * @param {Object} params.auditContext
 *
 * @returns {Object} { errorCode, isSuccess: true } | { errorCode, isSuccess: false, description }
 */
const deleteProductRequestService = async (productRequest, params) => {
  try {
    const { deletedBy, deletionReason, auditContext } = params;

    const updatePayload = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: deletedBy
    };

    const updatedProductRequest = await ProductRequestModel.findByIdAndUpdate(
      productRequest._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ────────────────────────────
    // For admin deletion, append reason to description
    const { user, device, requestId } = auditContext || {};
    let description = `Product request '${productRequest.title}' (${productRequest._id}) soft-deleted by ${deletedBy}. Reason: ${deletionReason}`;

    const { oldData, newData } = prepareAuditData(productRequest, updatedProductRequest);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_PRODUCT_REQUEST,
      description,
      { oldData, newData, adminActions: { targetId: productRequest._id } }
    );

    logWithTime(`✅ [deleteProductRequestService] Product request deleted successfully: ${productRequest._id}`);
    return {
      errorCode: OK,
      isSuccess: true
    };

  } catch (error) {
    logWithTime(`❌ [deleteProductRequestService] Error: ${error.message}`);
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
      description: "Internal error while deleting product request"
    };
  }
};

module.exports = { deleteProductRequestService };
