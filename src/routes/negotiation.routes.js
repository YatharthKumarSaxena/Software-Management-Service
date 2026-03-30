// routes/negotiation.routes.js

const express = require("express");
const negotiationRouter = express.Router();

const { NEGOTIATION_ROUTES } = require("@configs/uri.config");
const {
  createNegotiationRateLimiter,
  updateNegotiationRateLimiter,
  deleteNegotiationRateLimiter,
  freezeNegotiationRateLimiter,
  getNegotiationRateLimiter,
  getLatestNegotiationRateLimiter,
  listNegotiationsRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { negotiationControllers } = require("@controllers/negotiations");
const { negotiationMiddlewares } = require("@middlewares/negotiations");
const { projectMiddlewares } = require("@middlewares/projects");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { commonMiddlewares } = require("@/middlewares/common");

const {
  CREATE_NEGOTIATION,
  UPDATE_NEGOTIATION,
  DELETE_NEGOTIATION,
  GET_NEGOTIATION,
  GET_LATEST_NEGOTIATION,
  LIST_NEGOTIATIONS,
  FREEZE_NEGOTIATION
} = NEGOTIATION_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order for WRITE operations (CREATE, UPDATE, DELETE):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Role-based authorization      – Verify stakeholder.role in allowed roles (PROJECT_OWNER)
//  4. Resource fetch middleware     – Fetch negotiation (except CREATE which doesn't need it)
//  5. Presence + Validation         – Required fields + field-level validation
//  6. Controller                    – Business logic
//
// Middleware chain order for READ operations (GET, GET_LATEST, LIST):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Resource fetch middleware     – Fetch negotiation (not needed for LIST)
//  4. Controller                    – Business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /projects/:projectId/negotiations
 * Create a new negotiation for a project.
 * Allowed roles: PROJECT_OWNER
 */
negotiationRouter.post(
  CREATE_NEGOTIATION,
  [
    ...baseAuthAdminMiddlewares,
    createNegotiationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.createNegotiationStakeholderRoleAccessMiddleware
  ],
  negotiationControllers.createNegotiationController
);

/**
 * PATCH /projects/:projectId/negotiations/:negotiationId
 * Update a negotiation's mode.
 * Allowed roles: PROJECT_OWNER
 */
negotiationRouter.patch(
  UPDATE_NEGOTIATION,
  [
    ...baseAuthAdminMiddlewares,
    updateNegotiationRateLimiter,
    negotiationMiddlewares.fetchLatestNegotiationMiddleware,
    commonMiddlewares.checkNegotiationNotFrozen,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.updateNegotiationStakeholderRoleAccessMiddleware
  ],
  negotiationControllers.updateNegotiationController
);

/**
 * DELETE /projects/:projectId/negotiations/:negotiationId
 * Delete (soft delete) a negotiation.
 * Allowed roles: PROJECT_OWNER
 */
negotiationRouter.delete(
  DELETE_NEGOTIATION,
  [ 
    ...baseAuthAdminMiddlewares,
    deleteNegotiationRateLimiter,
    negotiationMiddlewares.fetchLatestNegotiationMiddleware,
    commonMiddlewares.checkNegotiationNotFrozen,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.deleteNegotiationStakeholderRoleAccessMiddleware,
    negotiationMiddlewares.deleteNegotiationPresenceMiddleware,
    negotiationMiddlewares.deleteNegotiationValidationMiddleware
  ],
  negotiationControllers.deleteNegotiationController
);

/**
 * GET /projects/:projectId/negotiations/:negotiationId
 * Retrieve a single negotiation by ID.
 * Allowed roles: All stakeholders (no role restriction)
 */
negotiationRouter.get(
  GET_NEGOTIATION,
  [
    ...baseAuthAdminMiddlewares,
    getNegotiationRateLimiter,
    negotiationMiddlewares.fetchNegotiationMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  negotiationControllers.getNegotiationController
);

/**
 * GET /projects/:projectId/negotiations/latest
 * Retrieve the latest negotiation for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
negotiationRouter.get(
  GET_LATEST_NEGOTIATION,
  [
    ...baseAuthAdminMiddlewares,
    getLatestNegotiationRateLimiter,
    negotiationMiddlewares.fetchLatestNegotiationMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  negotiationControllers.getLatestNegotiationController
);

/**
 * GET /projects/:projectId/negotiations
 * List all negotiations for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
negotiationRouter.get(
  LIST_NEGOTIATIONS,
  [
    ...baseAuthAdminMiddlewares,
    listNegotiationsRateLimiter,
    projectMiddlewares.fetchProjectMiddleware
  ],
  negotiationControllers.listNegotiationsController
);

/**
 * PATCH /projects/:projectId/negotiations/freeze/:projectId
 * Freeze the latest negotiation for a project.
 * Allowed roles: PROJECT_OWNER
 */
negotiationRouter.patch(
  FREEZE_NEGOTIATION,
  [
    ...baseAuthAdminMiddlewares,
    freezeNegotiationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.freezeNegotiationStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    negotiationMiddlewares.fetchLatestNegotiationMiddleware,
    commonMiddlewares.checkNegotiationNotFrozen
  ],
  negotiationControllers.freezeNegotiationController
);

module.exports = { negotiationRouter };
