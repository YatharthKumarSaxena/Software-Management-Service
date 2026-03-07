/**
 * Internal Routes
 * 
 * These routes are protected by service token authentication
 * Only other microservices with valid service tokens can access these endpoints
 */

const express = require("express");
const { createSuperAdminController } = require("@controllers/internals/create-super-admin.controller");
const { createUserController } = require("@controllers/internals/create-user.controller");
const {
  sendAuthServiceHealthSuccess,
  sendAdminPanelServiceHealthSuccess
} = require("@/responses/internals/common.response");
const { INTERNAL_ROUTES } = require("@configs/uri.config");
const { authInternalMiddlewares, adminPanelInternalMiddlewares } = require("./middleware.gateway.routes");
const { microserviceConfig } = require("@configs/microservice.config");
const { CREATE_SUPER_ADMIN, CREATE_USER, PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE, PROVIDE_HEALTH_CHECK_TO_ADMIN_PANEL_SERVICE } = INTERNAL_ROUTES;
const internalRouter = express.Router();

// Check if microservice mode is enabled
if (!microserviceConfig.enabled) {
  console.log('ℹ️  Internal routes disabled (monolithic mode)');
  module.exports = { internalRouter };
} else {
  // Load internal modules only in microservice mode
  const internal = require('../internals');

  if (!internal) {
    console.error('❌ Internal module not available');
    module.exports = { internalRouter };
  } else {
    // ==================== Bootstrap Routes ====================

    /**
     * @route   POST /internal/bootstrap/create-super-admin
     * @desc    Create initial super admin account (Bootstrap)
     * @access  Internal (Custom Auth Service ONLY)
     * @note    This endpoint should be called once during system initialization
     */
    internalRouter.post(CREATE_SUPER_ADMIN,
      authInternalMiddlewares,
      createSuperAdminController
    );

    // ==================== Admin Panel Routes ====================

    /**
     * @route   POST /internal/admin-panel/create-user
     * @desc    Create user (Client or Admin) from Admin Panel
     * @access  Internal (Admin Panel Service ONLY)
     * @note    type: "user" creates Client, type: "admin" creates Admin
     */
    internalRouter.post(CREATE_USER,
      adminPanelInternalMiddlewares,
      createUserController
    );

    // ==================== Health Check Routes (Service-Specific) ====================

    /**
     * @route   GET /internal/auth/health
     * @desc    Health check for auth service
     * @access  Internal (auth-service ONLY)
     */
    internalRouter.get(PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE, authInternalMiddlewares, (req, res) => {
      return sendAuthServiceHealthSuccess(res, req.serviceAuth);
    });

    /**
     * @route   GET /internal/admin-panel/health
     * @desc    Health check for admin panel service
     * @access  Internal (admin-panel-service ONLY)
     */
    internalRouter.get(PROVIDE_HEALTH_CHECK_TO_ADMIN_PANEL_SERVICE, adminPanelInternalMiddlewares, (req, res) => {
      return sendAdminPanelServiceHealthSuccess(res, req.serviceAuth);
    });

    module.exports = {
      internalRouter
    }
  }
}
