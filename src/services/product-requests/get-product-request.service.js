// services/product-requests/get-product-request.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { OK, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Fetches a single product request by ID.
 * 
 * Authorization:
 * - Admin: Can get any request
 * - Client: Can only get their own requests
 *
 * @param {Object} productRequest - The product request document (from middleware)
 * @param {Object} params
 * @param {Object} params.clientMongoId - Client's MongoDB _id (if client making request)
 * @param {boolean} params.isClient     - Whether requester is a client
 *
 * @returns {Object} { errorCode, isSuccess: true, data } | { errorCode, isSuccess: false, description }
 */
const getProductRequestService = async (productRequest, params) => {
  try {
    const { clientMongoId, isClient } = params;

    // ── Authorization check ───────────────────────────────────────────
    // For clients: only allow access to their own requests
    if (isClient) {
      // Compare MongoDB ObjectIds
      const requestExistsForClient = productRequest.requestedBy.toString() === clientMongoId?.toString();
      
      if (!requestExistsForClient) {
        logWithTime(`❌ [getProductRequestService] Client accessing unauthorized product request`);
        return {
          errorCode: NOT_FOUND,
          isSuccess: false,
          description: "Product request not found"
        };
      }
    }
    // Admins can access all requests (no additional check needed)

    logWithTime(`✅ [getProductRequestService] Product request retrieved successfully: ${productRequest._id}`);
    return {
      errorCode: OK,
      isSuccess: true,
      data: { productRequest }
    };

  } catch (error) {
    logWithTime(`❌ [getProductRequestService] Error: ${error.message}`);
    return {
      errorCode: INTERNAL_ERROR,
      isSuccess: false,
      description: "Internal error while retrieving product request"
    };
  }
};

module.exports = { getProductRequestService };
