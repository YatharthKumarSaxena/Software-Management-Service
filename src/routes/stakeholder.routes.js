// routes/stakeholder.routes.js

const express = require("express");
const stakeholderRouter = express.Router();

const { STAKEHOLDER_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { adminApiAuthorizationMiddleware: apiAuthorizationMiddleware } = require("@/middlewares/admins/admin-api-authorization.middleware");
const {
  createStakeholderRateLimiter,
  updateStakeholderRateLimiter,
  deleteStakeholderRateLimiter,
  getStakeholderRateLimiter,
  getStakeholdersRateLimiter,
} = require("@rate-limiters/general-api.rate-limiter");

const { createStakeholderController }   = require("@controllers/stakeholders/create-stakeholder.controller");
const { updateStakeholderController }   = require("@controllers/stakeholders/update-stakeholder.controller");
const { deleteStakeholderController }   = require("@controllers/stakeholders/delete-stakeholder.controller");
const { getStakeholderController }      = require("@controllers/stakeholders/get-stakeholder.controller");
const { getStakeholdersController }     = require("@/controllers/stakeholders/list-stakeholders.controller");
const { stakeholderMiddlewares }        = require("@/middlewares/stakeholders");

const {
  CREATE_STAKEHOLDER,
  UPDATE_STAKEHOLDER,
  DELETE_STAKEHOLDER,
  GET_STAKEHOLDER,
  LIST_STAKEHOLDERS: GET_STAKEHOLDERS,
} = STAKEHOLDER_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares     – device check, JWT verify, fetch admin, status checks
//  2. Rate limiter                 – per-user+device window
//  3. Role-auth middleware         – admin.role must be in allowedRoles
//  4. fetchStakeholderMiddleware   – (mutating ops) load stakeholder, guard deleted
//  5. Presence middleware          – required fields in req.body
//  6. Validation middleware        – type / length / enum checks
//  7. Role-guard middleware        – verify userId matches role type (admin vs client)
//  8. Controller                   – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/admin/create-stakeholder
 * Add a user as a stakeholder to a project.
 * Allowed roles: CEO, Business Analyst, Manager
 */
stakeholderRouter.post(
  CREATE_STAKEHOLDER,
  [
    ...baseAuthAdminMiddlewares,
    createStakeholderRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminCreateStakeholder,
    stakeholderMiddlewares.createStakeholderPresenceMiddleware,
    stakeholderMiddlewares.createStakeholderValidationMiddleware,
    stakeholderMiddlewares.createStakeholderRoleGuardMiddleware,
  ],
  createStakeholderController
);

/**
 * PATCH /software-management-service/api/v1/admin/update-stakeholder/:stakeholderId
 * Update the role of an existing stakeholder.
 * Allowed roles: CEO, Business Analyst, Manager
 */
stakeholderRouter.patch(
  UPDATE_STAKEHOLDER,
  [
    ...baseAuthAdminMiddlewares,
    updateStakeholderRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminUpdateStakeholder,

    stakeholderMiddlewares.updateStakeholderPresenceMiddleware,
    stakeholderMiddlewares.updateStakeholderValidationMiddleware,
    stakeholderMiddlewares.updateStakeholderRoleGuardMiddleware,
  ],
  updateStakeholderController
);

/**
 * DELETE /software-management-service/api/v1/admin/delete-stakeholder/:stakeholderId
 * Soft-delete a stakeholder. Deletion reason is REQUIRED.
 * Allowed roles: CEO, Manager
 */
stakeholderRouter.delete(
  DELETE_STAKEHOLDER,
  [
    ...baseAuthAdminMiddlewares,
    deleteStakeholderRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminDeleteStakeholder,

    stakeholderMiddlewares.deleteStakeholderPresenceMiddleware,
    stakeholderMiddlewares.deleteStakeholderValidationMiddleware,
  ],
  deleteStakeholderController
);

/**
 * GET /software-management-service/api/v1/stakeholders/get/:stakeholderId
 * Fetch a single stakeholder by stakeholderId.
 * Allowed roles: All admin roles OR if admin is a stakeholder of any project
 */
stakeholderRouter.get(
  GET_STAKEHOLDER,
  [
    ...baseAuthAdminMiddlewares,
    getStakeholderRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminGetStakeholderOrMember,
  ],
  getStakeholderController
);

/**
 * GET /software-management-service/api/v1/stakeholders/list
 * List stakeholders with optional filters and pagination.
 * Allowed roles: All admin roles OR if admin is a stakeholder of any project
 */
stakeholderRouter.get(
  GET_STAKEHOLDERS,
  [
    ...baseAuthAdminMiddlewares,
    getStakeholdersRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminGetStakeholdersOrMember,
  ],
  getStakeholdersController
);

module.exports = { stakeholderRouter };
