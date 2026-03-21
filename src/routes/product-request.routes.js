const express = require("express");
const productRequestRouter = express.Router();

const { PRODUCT_REQUEST_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { baseAuthClientMiddlewares } = require("./middleware.gateway.routes");
const {
  createProductRequestRateLimiter,
  updateProductRequestRateLimiter,
  deleteProductRequestRateLimiter,
  getProductRequestRateLimiter,
  listProductRequestsRateLimiter,
  approveProductRequestRateLimiter,
  rejectProductRequestRateLimiter,
  cancelProductRequestRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { productRequestControllers } = require("@controllers/product-requests");
const { productRequestMiddlewares } = require("@/middlewares/product-requests");

const {
  CREATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_REQUEST,
  DELETE_PRODUCT_REQUEST,
  GET_PRODUCT_REQUEST,
  LIST_PRODUCT_REQUESTS,
  APPROVE_PRODUCT_REQUEST,
  REJECT_PRODUCT_REQUEST,
  CANCEL_PRODUCT_REQUEST
} = PRODUCT_REQUEST_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthMiddlewares       – device check, JWT verify, fetch admin/client, status checks
//  2. Rate limiter              – per-user+device window
//  3. Fetch product request     – fetch by ID and check isDeleted combo
//  4. Validation middleware     – type / length / enum checks
//  5. Controller                – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/product-requests/create
 * Create a new product request.
 * Access: Stakeholder (Client)
 */
productRequestRouter.post(
  CREATE_PRODUCT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    createProductRequestRateLimiter,
    productRequestMiddlewares.createProductRequestPresenceMiddleware,
    productRequestMiddlewares.createProductRequestValidationMiddleware
  ],
  productRequestControllers.createProductRequestController
);

/**
 * PATCH /software-management-service/api/v1/product-requests/update/:requestId
 * Update an existing product request.
 * Access: Stakeholder (Client) - only if status is PENDING
 */
productRequestRouter.patch(
  UPDATE_PRODUCT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    updateProductRequestRateLimiter,
    productRequestMiddlewares.fetchProductRequestMiddleware,
    productRequestMiddlewares.updateProductRequestPresenceMiddleware, // Checks if client owns the request and status is PENDING
    productRequestMiddlewares.updateProductRequestValidationMiddleware,
  ],
  productRequestControllers.updateProductRequestController
);

/**
 * DELETE /software-management-service/api/v1/product-requests/delete/:requestId
 * Soft-delete a product request.
 * Access: Client & Admin
 * Admin deletion requires reason
 */
productRequestRouter.delete(
  DELETE_PRODUCT_REQUEST,
  [
    ...baseAuthAdminMiddlewares,
    deleteProductRequestRateLimiter,
    productRequestMiddlewares.authorizeAdminDeleteProductRequest, // Checks if client owns the request (if client) and if admin, checks for reason
    productRequestMiddlewares.fetchProductRequestMiddleware,
    productRequestMiddlewares.deleteProductRequestPresenceMiddleware, // Checks if client owns the request (if client) and if admin, checks for reason
    productRequestMiddlewares.deleteProductRequestValidationMiddleware,
  ],
  productRequestControllers.deleteProductRequestController
);

/**
 * GET /software-management-service/api/v1/product-requests/get/:requestId
 * Get a single product request.
 * Access: Client & Admin
 * Client can only view their own requests
 */
productRequestRouter.get(
  GET_PRODUCT_REQUEST,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getProductRequestRateLimiter,
    productRequestMiddlewares.fetchProductRequestMiddleware,
  ],
  productRequestControllers.getProductRequestController
);

/**
 * GET /software-management-service/api/v1/product-requests/list
 * List product requests.
 * Access: Admin (all) & Client (own requests only)
 */
productRequestRouter.get(
  LIST_PRODUCT_REQUESTS,
  [
    ...baseAuthClientOrAdminMiddlewares,
    listProductRequestsRateLimiter,
  ],
  productRequestControllers.listProductRequestsController
);

/**
 * PATCH /software-management-service/api/v1/product-requests/approve/:requestId
 * Approve a product request.
 * Access: Admin Only
 */
productRequestRouter.patch(
  APPROVE_PRODUCT_REQUEST,
  [
    ...baseAuthAdminMiddlewares,
    approveProductRequestRateLimiter,
    productRequestMiddlewares.authorizeAdminApproveProductRequest,
    productRequestMiddlewares.approveProductRequestPresenceMiddleware,
    productRequestMiddlewares.approveProductRequestValidationMiddleware,
    productRequestMiddlewares.fetchProductRequestMiddleware
  ],
  productRequestControllers.approveProductRequestController
);

/**
 * PATCH /software-management-service/api/v1/product-requests/reject/:requestId
 * Reject a product request.
 * Access: Admin Only
 */
productRequestRouter.patch(
  REJECT_PRODUCT_REQUEST,
  [
    ...baseAuthAdminMiddlewares,
    rejectProductRequestRateLimiter,
    productRequestMiddlewares.authorizeAdminRejectProductRequest,
    productRequestMiddlewares.rejectProductRequestPresenceMiddleware,
    productRequestMiddlewares.rejectProductRequestValidationMiddleware,
    productRequestMiddlewares.fetchProductRequestMiddleware,
  ],
  productRequestControllers.rejectProductRequestController
);

/**
 * PATCH /software-management-service/api/v1/product-requests/cancel/:requestId
 * Cancel a product request.
 * Access: Admin Only
 */
productRequestRouter.patch(
  CANCEL_PRODUCT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    cancelProductRequestRateLimiter,
    productRequestMiddlewares.fetchProductRequestMiddleware
  ],
  productRequestControllers.cancelProductRequestController
);

module.exports = { productRequestRouter };