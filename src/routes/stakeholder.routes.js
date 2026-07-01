// routes/stakeholder.routes.js

const express = require("express");
const stakeholderRouter = express.Router();

const { STAKEHOLDER_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { adminApiAuthorizationMiddleware: apiAuthorizationMiddleware } = require("@/middlewares/admins/admin-api-authorization.middleware");
const {
  createStakeholderRateLimiter,
  updateStakeholderRateLimiter,
  deleteStakeholderRateLimiter,
  getStakeholderRateLimiter,
  getStakeholdersRateLimiter,
} = require("@rate-limiters/general-api.rate-limiter");

const { stakeholderControllers } = require("@controllers/stakeholders");
const { stakeholderMiddlewares } = require("@/middlewares/stakeholders");
const { projectMiddlewares } = require("@/middlewares/projects");

const {
  CREATE_STAKEHOLDER,
  UPDATE_STAKEHOLDER,
  DELETE_STAKEHOLDER,
  GET_STAKEHOLDER,
  LIST_STAKEHOLDERS
} = STAKEHOLDER_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares     – device check, JWT verify, fetch admin, status checks
//  2. Rate limiter                 – per-user+device window
//  3. Role-auth middleware         – admin.role must be in allowedRoles
//  4. fetchProjectMiddleware       – load project from req.body.projectId (create-stakeholder only)
//  5. fetchStakeholderMiddleware   – (update/delete ops) load stakeholder, guard deleted
//  6. Presence middleware          – required fields in req.body
//  7. Validation middleware        – type / length / enum checks
//  8. Role-guard middleware        – verify userId matches role type (admin vs client)
//  9. Controller                   – business logic
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
    projectMiddlewares.fetchProjectMiddleware,
    stakeholderMiddlewares.checkUserIsStakeholder,
    apiAuthorizationMiddleware.authorizeAdminCreateStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,
    stakeholderMiddlewares.createStakeholderPresenceMiddleware,
    stakeholderMiddlewares.createStakeholderValidationMiddleware,
    stakeholderMiddlewares.createStakeholderRoleGuardMiddleware,
  ],
  stakeholderControllers.createStakeholderController
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
    stakeholderMiddlewares.fetchStakeholderMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    stakeholderMiddlewares.checkUserIsStakeholder,
    apiAuthorizationMiddleware.authorizeAdminUpdateStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,
    stakeholderMiddlewares.updateStakeholderPresenceMiddleware,
    stakeholderMiddlewares.updateStakeholderValidationMiddleware,
    stakeholderMiddlewares.updateStakeholderRoleGuardMiddleware,
  ],
  stakeholderControllers.updateStakeholderController
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
    stakeholderMiddlewares.fetchStakeholderMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    stakeholderMiddlewares.checkUserIsStakeholder,
    apiAuthorizationMiddleware.authorizeAdminDeleteStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,
    stakeholderMiddlewares.deleteStakeholderPresenceMiddleware,
    stakeholderMiddlewares.deleteStakeholderValidationMiddleware,
  ],
  stakeholderControllers.deleteStakeholderController
);

/**
 * GET /software-management-service/api/v1/stakeholders/get/:stakeholderId
 * Fetch a single stakeholder by stakeholderId.
 * Allowed roles: All admin roles OR if admin is a stakeholder of any project
 */
stakeholderRouter.get(
  GET_STAKEHOLDER,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getStakeholderRateLimiter,
    stakeholderMiddlewares.fetchStakeholderMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    stakeholderMiddlewares.checkUserIsStakeholder
  ],
  stakeholderControllers.getStakeholderController
);

/**
 * GET /software-management-service/api/v1/stakeholders/list
 * List stakeholders with optional filters and pagination.
 * Allowed roles: All admin roles OR if admin is a stakeholder of any project
 */
stakeholderRouter.get(
  LIST_STAKEHOLDERS,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getStakeholdersRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    stakeholderMiddlewares.checkUserIsStakeholder
  ],
  stakeholderControllers.listStakeholdersController
);

module.exports = { stakeholderRouter };
