// services/product-requests/update-product-request.service.js

const { ProductRequestModel } = require("@models/product-request.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { RequestStatus } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Updates an existing product request.
 * 
 * Authorization:
 * - Stakeholder: Can always update
 * - Client: Can only update if status is PENDING
 *
 * @param {Object} productRequest        - The product request document
 * @param {Object} params
 * @param {Object} params.updateData     - Fields to update
 * @param {string} params.updatedBy      - Client/Admin ID who is updating
 * @param {Object} params.auditContext
 *
 * @returns {Object} { errorCode, isSuccess: true, data } | { errorCode, isSuccess: false, description }
 */
const updateProductRequestService = async (productRequest, params) => {
  try {
    const { updateData, updatedBy, auditContext } = params;

    const { expectedTimelineInDays, budget } = updateData; // Destructure fields to update if needed for validation
    
    if (expectedTimelineInDays !== undefined) {
      if (typeof expectedTimelineInDays !== "number" || isNaN(expectedTimelineInDays)) {
        logWithTime(`❌ [updateProductRequestService] Invalid expectedTimelineInDays type`);
        return {
          errorCode: BAD_REQUEST,
          isSuccess: false,
          description: "expectedTimelineInDays must be a valid number"
        };
      }

      if (expectedTimelineInDays < 1) {
        logWithTime(`❌ [updateProductRequestService] Invalid expectedTimelineInDays`);
        return {
          errorCode: BAD_REQUEST,
          isSuccess: false,
          description: "expectedTimelineInDays must be at least 1"
        };
      }
    }

    if (budget !== undefined) {
      if (typeof budget !== "number" || isNaN(budget)) {
        logWithTime(`❌ [updateProductRequestService] Budget must be a valid number`);
        return {
          errorCode: BAD_REQUEST,
          isSuccess: false,
          description: "Budget must be a valid number"
        };
      }

      if (budget < 0) {
        logWithTime(`❌ [updateProductRequestService] Invalid budget`);
        return {
          errorCode: BAD_REQUEST,
          isSuccess: false,
          description: "Budget must be a positive number"
        };
      }
    }

    // ── Authorization check ───────────────────────────────────────────
    if (productRequest.status !== RequestStatus.PENDING) {
      logWithTime(`❌ [updateProductRequestService] Client can only update pending requests`);
      return {
        errorCode: FORBIDDEN,
        isSuccess: false,
        description: "Clients can only update product requests that are in PENDING status"
      };
    }

    // ── Check if there are any actual changes ─────────────────────────
    const hasChanges = Object.keys(updateData).some((key) => {
      const oldValue = productRequest[key];
      const newValue = updateData[key];
      // Compare values - handle different types properly
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    });

    // If no changes detected, return early
    if (!hasChanges) {
      logWithTime(
        `ℹ️ [updateProductRequestService] No changes detected for product request: ${productRequest._id}`
      );
      return {
        errorCode: OK,
        isSuccess: true,
        message: "No changes detected",
        data: { productRequest: productRequest.toObject ? productRequest.toObject() : productRequest }
      };
    }

    // ── Build update payload ──────────────────────────────────────────
    const updatePayload = {
      ...updateData
    };

    const updatedProductRequest = await ProductRequestModel.findByIdAndUpdate(
      productRequest._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(productRequest, updatedProductRequest);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_PRODUCT_REQUEST,
      `Product request '${updatedProductRequest.title}' (${productRequest._id}) updated by ${updatedBy}`,
      { oldData, newData, adminActions: { targetId: productRequest._id } }
    );

    logWithTime(`✅ [updateProductRequestService] Product request updated successfully: ${productRequest._id}`);
    return {
      errorCode: OK,
      isSuccess: true,
      data: { productRequest: updatedProductRequest }
    };

  } catch (error) {
    logWithTime(`❌ [updateProductRequestService] Error: ${error.message}`);
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
      description: "Internal error while updating product request"
    };
  }
};

module.exports = { updateProductRequestService };
