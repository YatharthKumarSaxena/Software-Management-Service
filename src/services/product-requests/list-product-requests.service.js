// services/product-requests/list-product-requests.service.js

const { ProductRequestModel } = require("@models/product-request.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Lists product requests based on user type.
 * 
 * Authorization:
 * - Admin: Can see all product requests
 * - Client: Can only see their own raised product requests
 *
 * @param {Object} params
 * @param {Object} params.clientMongoId  - Client's MongoDB _id (if client making request)
 * @param {boolean} params.isClient      - Whether the user is a client
 * @param {number} [params.page]         - Page number (default: 1)
 * @param {number} [params.limit]        - Records per page (default: 10)
 * @param {Object} [params.filters]      - Additional filters (status, priority, etc.)
 *
 * @returns {Object} { errorCode, isSuccess: true, data } | { errorCode, isSuccess: false, description }
 */
const listProductRequestsService = async (params) => {
  try {
    const { clientMongoId, isClient, page = 1, limit = 10, filters = {} } = params;

    // ── Build query based on user type ────────────────────────────────
    let query = { isDeleted: false };

    if (isClient && clientMongoId) {
      // Clients can only see their own requests
      query.requestedBy = clientMongoId;
    }
    // Admins can see all (no additional filter)

    // ── Apply additional filters ──────────────────────────────────────
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.projectType) {
      query.projectType = filters.projectType;
    }

    const skip = (page - 1) * limit;

    const productRequests = await ProductRequestModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ProductRequestModel.countDocuments(query);

    logWithTime(`✅ [listProductRequestsService] Retrieved ${productRequests.length} product requests`);
    return {
      errorCode: OK,
      isSuccess: true,
      data: {
        productRequests,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    };

  } catch (error) {
    logWithTime(`❌ [listProductRequestsService] Error: ${error.message}`);
    return {
      errorCode: INTERNAL_ERROR,
      isSuccess: false,
      description: "Internal error while listing product requests"
    };
  }
};

module.exports = { listProductRequestsService };
