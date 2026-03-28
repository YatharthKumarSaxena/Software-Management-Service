// routes/scope.routes.js

const express = require("express");
const scopeRouter = express.Router();

const { SCOPE_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { scopeControllers } = require("@controllers/scopes");
const { scopeMiddlewares } = require("@/middlewares/scopes");
const { projectMiddlewares } = require("@/middlewares/projects");
const { createScopeRateLimiter, updateScopeRateLimiter, deleteScopeRateLimiter, getScopeRateLimiter, listScopesRateLimiter } = require("@/rate-limiters/general-api.rate-limiter");
const { commonMiddlewares } = require("@/middlewares/common");

const {
  CREATE_SCOPE,
  UPDATE_SCOPE,
  DELETE_SCOPE,
  GET_SCOPE,
  LIST_SCOPES
} = SCOPE_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares       – device check, JWT verify, fetch admin, status checks
//  2. API authorization              – admin.role must be in allowedRoles
//  3. fetchProjectMiddleware         – load project from params/body
//  4. fetchInceptionFromProject      – load inception for project
//  5. checkUserIsStakeholder         – verify admin is stakeholder of project
//  6. fetchScopeMiddleware           – (update/delete) load scope
//  7. activeProjectGuardMiddleware   – verify project is not DRAFT
//  8. Presence middleware            – required fields in req.body
//  9. Validation middleware          – type / length / enum checks
// 10. Controller                     – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/admin/create-scope/:projectId
 * Create a new scope for the project's current inception phase.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project
 */
scopeRouter.post(
  CREATE_SCOPE,
  [
    ...baseAuthAdminMiddlewares,
    createScopeRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    scopeMiddlewares.fetchInceptionFromProjectMiddleware,
    commonMiddlewares.checkInceptionNotFrozen,
    commonMiddlewares.checkUserIsStakeholder,
    scopeMiddlewares.createScopePresenceMiddleware,
    scopeMiddlewares.createScopeValidationMiddleware,
  ],
  scopeControllers.createScopeController
);

/**
 * PATCH /software-management-service/api/v1/admin/update-scope/:scopeId
 * Update an existing scope.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project, project is not DRAFT
 */
scopeRouter.patch(
  UPDATE_SCOPE,
  [
    ...baseAuthAdminMiddlewares,
    updateScopeRateLimiter,
    scopeMiddlewares.fetchScopeMiddleware,
    commonMiddlewares.checkInceptionNotFrozen,
    projectMiddlewares.activeProjectGuardMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    scopeMiddlewares.updateScopePresenceMiddleware,
    scopeMiddlewares.updateScopeValidationMiddleware,
  ],
  scopeControllers.updateScopeController
);

/**
 * DELETE /software-management-service/api/v1/admin/delete-scope/:scopeId
 * Soft-delete a scope. Optional deletion reason can be provided.
 * Allowed roles: CEO, Manager
 * Requires: admin is a stakeholder of the project, project is not DRAFT
 */
scopeRouter.delete(
  DELETE_SCOPE,
  [
    ...baseAuthAdminMiddlewares,
    deleteScopeRateLimiter,
    scopeMiddlewares.fetchScopeMiddleware,
    commonMiddlewares.checkInceptionNotFrozen,
    projectMiddlewares.activeProjectGuardMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    scopeMiddlewares.deleteScopeValidationMiddleware,
  ],
  scopeControllers.deleteScopeController
);

/**
 * GET /software-management-service/api/v1/scope/get/:scopeId
 * Fetch a single scope. Accessible by both admin and client stakeholders.
 */
scopeRouter.get(
  GET_SCOPE,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getScopeRateLimiter,
    scopeMiddlewares.fetchScopeMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
  ],
  scopeControllers.getScopeController
);

/**
 * GET /software-management-service/api/v1/scope/list/:projectId
 * List all scopes for a project's inception. Accessible by both admin and client stakeholders.
 */
scopeRouter.get(
  LIST_SCOPES,
  [
    ...baseAuthClientOrAdminMiddlewares,
    listScopesRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    scopeMiddlewares.fetchInceptionFromProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
  ],
  scopeControllers.listScopesController
);

module.exports = { scopeRouter };
