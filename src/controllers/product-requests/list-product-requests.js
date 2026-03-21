// controllers/product-requests/list-product-requests.js

const { listProductRequestsService } = require("@services/product-requests");
const { sendProductRequestsListSuccess } = require("@/responses/success/product-request.response");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Controller: List Product Requests
 *
 * @route  GET /software-management-service/api/v1/product-requests
 * @access Private – Admin / Client
 *
 * Admin: Can see all product requests
 * Client: Can see only their own raised product requests
 *
 * @query {number} [page]   - Page number (default: 1)
 * @query {number} [limit]  - Records per page (default: 10)
 * @query {string} [status] - Filter by status
 * @query {string} [priority] - Filter by priority
 * @query {string} [projectType] - Filter by project type
 *
 * @returns {200} Product requests listed successfully
 * @returns {500} Internal server error
 */
const listProductRequestsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, projectType } = req.query;

    // Determine user type and extract proper client MongoDB _id
    let isClient = false;
    let clientMongoId = null;

    if (req.admin) {
      // Admin - no client restriction
      isClient = false;
    } else if (req.client) {
      clientMongoId = req.client._id;
      isClient = true;
    }

    // Parse pagination params
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (projectType) filters.projectType = projectType;

    // ── Call service ────────────────────────────────────────────────────
    const result = await listProductRequestsService({
      clientMongoId,
      isClient,
      page: parsedPage,
      limit: parsedLimit,
      filters
    });

    // ── Handle response based on errorCode ──────────────────────────────
    if (!result.isSuccess) {
      if (result.errorCode === INTERNAL_ERROR) {
        logWithTime(`❌ [listProductRequestsController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwInternalServerError(res, result.description);
      }

      logWithTime(`❌ [listProductRequestsController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [listProductRequestsController] Product requests listed successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestsListSuccess(res, result.data.productRequests, result.data.pagination);

  } catch (error) {
    logWithTime(`❌ [listProductRequestsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listProductRequestsController };
