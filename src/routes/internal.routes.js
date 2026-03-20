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
const { deleteUser } = require("@/controllers/internals/delete-user.controller");
const { toggleActiveStatus } = require("@/controllers/internals/toggle-active-status.controller");
const { updateUserDetails } = require("@/controllers/internals/update-user-details.controller");
const { toggleBlockDeviceStatus } = require("@/controllers/internals/toggle-block-status-device.controller");
const { toggleBlockUserStatus } = require("@/controllers/internals/toggle-block-status-user.controller");
const { CREATE_SUPER_ADMIN, CREATE_USER, PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE, PROVIDE_HEALTH_CHECK_TO_ADMIN_PANEL_SERVICE, DELETE_USER, TOGGLE_ACTIVE_STATUS, UPDATE_USER_DETAILS, TOGGLE_BLOCK_DEVICE_STATUS, TOGGLE_BLOCK_USER_STATUS } = INTERNAL_ROUTES;
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

    internalRouter.delete(DELETE_USER, authInternalMiddlewares, deleteUser);

    internalRouter.patch(TOGGLE_ACTIVE_STATUS, authInternalMiddlewares, toggleActiveStatus);

    internalRouter.patch(UPDATE_USER_DETAILS, authInternalMiddlewares, updateUserDetails);

    internalRouter.patch(TOGGLE_BLOCK_DEVICE_STATUS, adminPanelInternalMiddlewares, toggleBlockDeviceStatus);

    internalRouter.patch(TOGGLE_BLOCK_USER_STATUS, adminPanelInternalMiddlewares, toggleBlockUserStatus);

    module.exports = {
      internalRouter
    }
  }
}
