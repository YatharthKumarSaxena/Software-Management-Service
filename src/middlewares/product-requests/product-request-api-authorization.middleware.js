const {
  createAdminRoleAuthMiddleware
} = require("@middlewares/factory/role-authorization.middleware-factory");

const { ApiRolePermissions } = require("@configs/api-role-permissions.config");

// ─────────────────────────────────────────────────────────────────────────────
// Admin role-authorization middlewares for Product Requests
// ─────────────────────────────────────────────────────────────────────────────

const authorizeAdminDeleteProductRequest = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.deleteProductRequest);
const authorizeAdminApproveProductRequest = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.approveProductRequest);
const authorizeAdminRejectProductRequest = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.rejectProductRequest);

const productRequestApiAuthorizationMiddleware = {
  authorizeAdminDeleteProductRequest,
  authorizeAdminApproveProductRequest,
  authorizeAdminRejectProductRequest
};

module.exports = { productRequestApiAuthorizationMiddleware };