// routes/inception.routes.js

const express = require("express");
const inceptionRouter = express.Router();

const { INCEPTION_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const {
  createInceptionRateLimiter,
  updateInceptionRateLimiter,
  deleteInceptionRateLimiter,
  getInceptionRateLimiter,
  getLatestInceptionRateLimiter,
  listInceptionsRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { inceptionControllers } = require("@controllers/inceptions");
const { inceptionMiddlewares } = require("@/middlewares/inceptions");
const { projectMiddlewares } = require("@/middlewares/projects");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");

const {
  CREATE_INCEPTION,
  UPDATE_INCEPTION,
  DELETE_INCEPTION,
  GET_INCEPTION,
  GET_LATEST_INCEPTION,
  LIST_INCEPTIONS
} = INCEPTION_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares  – device check, JWT verify, fetch admin, status checks
//  2. Rate limiter               – per-user+device window
//  3. Role-auth middleware       – admin.role must be in allowedRoles
//  4. Controller                 – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /software-management-service/api/v1/inceptions/get/:projectId
 * Fetch the latest cycle inception for a project.
 * Allowed roles: All admin roles (CEO, Business Analyst, Manager, Analyst, Developer, Other)
 */
inceptionRouter.get(
  GET_INCEPTION,
  [
    ...baseAuthAdminMiddlewares,
    getInceptionRateLimiter,
    inceptionMiddlewares.fetchInceptionMiddleware, // Validates inceptionId, fetches inception document for controller
    projectMiddlewares.fetchProjectMiddleware, // Validates projectId, fetches project document for controller
    checkUserIsStakeholder
  ],
  inceptionControllers.getInceptionController
);

inceptionRouter.get(
  GET_LATEST_INCEPTION,
  [
    ...baseAuthAdminMiddlewares,
    getLatestInceptionRateLimiter,
    projectMiddlewares.fetchProjectMiddleware, // Validates projectId, fetches project document for controller
    checkUserIsStakeholder,
    inceptionMiddlewares.fetchLatestAnyStatusInceptionMiddleware
  ],
  inceptionControllers.getLatestInceptionController
);

/**
 * GET /software-management-service/api/v1/inceptions/get/:inceptionId
 * Fetch a specific inception by ID.
 * Allowed roles: All admin roles (CEO, Business Analyst, Manager, Analyst, Developer, Other)

/**
 * GET /software-management-service/api/v1/inceptions/list/:projectId
 * Fetch all inceptions for a project.
 * Allowed roles: All admin roles (CEO, Business Analyst, Manager, Analyst, Developer, Other)
 */
inceptionRouter.get(
  LIST_INCEPTIONS,
  [
    ...baseAuthAdminMiddlewares,
    listInceptionsRateLimiter,
    projectMiddlewares.fetchProjectMiddleware, // Validates projectId, fetches project document for controller
    checkUserIsStakeholder
  ],
  inceptionControllers.listInceptionsController
);

/**
 * DELETE /software-management-service/api/v1/inceptions/delete/:inceptionId
 * Delete an inception. If the project is in Project Development, prevent deletion.
 * Allowed roles: CEO only
 * 
 * Middleware chain:
 * 1. baseAuthAdminMiddlewares        – device check, JWT verify, fetch admin
 * 2. deleteInceptionRateLimiter       – per-user+device window (5/min)
 * 3. fetchInceptionMiddleware         – validates inceptionId, fetches inception document
 * 4. checkInceptionNotFrozen          – validate inception phase is not frozen
 * 5. fetchProjectMiddleware           – fetch project from inception.projectId
 * 6. activeProjectGuardMiddleware     – validate project is ACTIVE or DRAFT
 * 7. checkUserIsStakeholder           – verify admin is stakeholder of project
 * 8. createInceptionRoleAccessMiddleware – role validation (CEO for delete)
 * 9. deleteInceptionPresenceMiddleware – validates required fields in body
 * 10. deleteInceptionValidationMiddleware – validates field types and enum values
 * 11. deleteInceptionController       – performs soft-delete with audit logging
 */
inceptionRouter.delete(
  DELETE_INCEPTION,
  [
    ...baseAuthAdminMiddlewares,
    deleteInceptionRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.deleteInceptionStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    inceptionMiddlewares.fetchLatestNotFrozenInceptionMiddleware,
    inceptionMiddlewares.deleteInceptionPresenceMiddleware,
    inceptionMiddlewares.deleteInceptionValidationMiddleware
  ],
  inceptionControllers.deleteInceptionController
);

inceptionRouter.post(
  CREATE_INCEPTION,
  [
    ...baseAuthAdminMiddlewares,
    createInceptionRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.createInceptionStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    inceptionMiddlewares.createInceptionPresenceMiddleware,
    inceptionMiddlewares.createInceptionValidationMiddleware
  ],
  inceptionControllers.createInceptionController
);

inceptionRouter.patch(
  UPDATE_INCEPTION,
  [
    ...baseAuthAdminMiddlewares,
    updateInceptionRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.updateInceptionStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    inceptionMiddlewares.fetchLatestNotFrozenInceptionMiddleware,
    inceptionMiddlewares.updateInceptionPresenceMiddleware,
    inceptionMiddlewares.updateInceptionValidationMiddleware
  ],
  inceptionControllers.updateInceptionController
);

module.exports = {
  inceptionRouter
};
