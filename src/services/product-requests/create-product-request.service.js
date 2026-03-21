// services/product-requests/create-product-request.service.js

const mongoose = require("mongoose");
const { ProductRequestModel } = require("@models/product-request.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { RequestStatus } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CREATED, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Creates a new product request document in the database.
 * 
 * Only Stakeholders can create product requests.
 *
 * @param {Object} params
 * @param {string} params.title                - Product request title
 * @param {string} params.description          - Product request description
 * @param {string} params.projectType          - Type of project
 * @param {string} params.projectCategory      - Category of project
 * @param {string} params.requestedBy          - Client ID who requested
 * @param {string} params.priority             - Priority level
 * @param {number} params.expectedTimelineInDays - Expected timeline in days
 * @param {number} [params.budget]             - Optional budget
 * @param {Object} params.auditContext         - Audit context {user, device, requestId}
 *
 * @returns {Object} { errorCode, isSuccess: true, data } | { errorCode, isSuccess: false, description }
 */
const createProductRequestService = async ({
  title,
  description,
  projectType,
  projectCategory,
  requestedBy,
  priority,
  expectedTimelineInDays,
  budget,
  auditContext
}) => {
  try {

    if (expectedTimelineInDays !== undefined) {
      if (typeof expectedTimelineInDays !== "number" || isNaN(expectedTimelineInDays)) {
        logWithTime(`❌ [createProductRequestService] Invalid expectedTimelineInDays type`);
        return {
          errorCode: BAD_REQUEST,
          isSuccess: false,
          description: "expectedTimelineInDays must be a valid number"
        };
      }

      if (expectedTimelineInDays < 1) {
        logWithTime(`❌ [createProductRequestService] Invalid expectedTimelineInDays`);
        return {
          errorCode: BAD_REQUEST,
          isSuccess: false,
          description: "expectedTimelineInDays must be at least 1"
        };
      }
    }

    if (budget !== undefined) {
      if (typeof budget !== "number" || isNaN(budget)) {
        logWithTime(`❌ [createProductRequestService] Budget must be a valid number`);
        return {
          errorCode: BAD_REQUEST,
          isSuccess: false,
          description: "Budget must be a valid number"
        };
      }

      if (budget < 0) {
        logWithTime(`❌ [createProductRequestService] Invalid budget`);
        return {
          errorCode: BAD_REQUEST,
          isSuccess: false,
          description: "Budget must be a positive number"
        };
      }
    }

    const requesterId = requestedBy._id;
    const clientId = requestedBy.clientId;

    // ── Create the product request ────────────────────────────────────
    const productRequestId = new mongoose.Types.ObjectId();

    const productRequest = await ProductRequestModel.create({
      _id: productRequestId,
      title,
      description,
      projectType,
      projectCategory,
      requestedBy: requesterId,
      priority,
      expectedTimelineInDays,
      budget: budget || null,
      status: RequestStatus.PENDING,
      isDeleted: false,
    });

    // ── Fire-and-forget: activity tracking ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_PRODUCT_REQUEST,
      `Product request '${productRequest.title}' (${productRequest._id}) created by Client ${clientId}`,
      { oldData: null, newData: productRequest }
    );

    logWithTime(`✅ [createProductRequestService] Product request created successfully: ${productRequest._id}`);
    return {
      errorCode: CREATED,
      isSuccess: true,
      data: { productRequest }
    };

  } catch (error) {
    logWithTime(`❌ [createProductRequestService] Error: ${error.message}`);
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
      description: "Internal error while creating product request"
    };
  }
};

module.exports = { createProductRequestService };
