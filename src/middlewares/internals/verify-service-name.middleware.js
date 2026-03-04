const { service } = require("@/configs/security.config");
const { createVerifyServiceMiddleware } = require("../factory/verify-service.middleware-factory");


// ==================== Pre-configured Service Middlewares ====================

/**
 * Middleware for Auth Service verification
 * Restricts endpoint access to 'auth-service' only
 * 
 * @example
 * router.post("/internal/sync-users", authServiceMiddleware, controller);
 */
const authServiceMiddleware = createVerifyServiceMiddleware({
  middlewareName: "AuthService",
  expectedServiceName: service.Custom_Auth_Service_Name,
  expectedTokenSecret: service.CUSTOM_AUTH_SERVICE_TOKEN_SECRET
});

/**
 * Middleware for Admin Panel Service verification
 * Restricts endpoint access to 'admin-panel-service' only
 * 
 * @example
 * router.post("/internal/sync-admins", adminPanelServiceMiddleware, controller);
 */
const adminPanelServiceMiddleware = createVerifyServiceMiddleware({
  middlewareName: "AdminPanelService",
  expectedServiceName: service.Admin_Panel_Service_Name,
  expectedTokenSecret: service.ADMIN_PANEL_SERVICE_TOKEN_SECRET
});

module.exports = {
  authServiceMiddleware,
  adminPanelServiceMiddleware
};