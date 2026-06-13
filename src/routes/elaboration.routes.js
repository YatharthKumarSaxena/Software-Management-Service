// routes/elaboration.routes.js

const express = require("express");
const elaborationRouter = express.Router();

const { ELABORATION_ROUTES } = require("@configs/uri.config");
const {
  createElaborationRateLimiter,
  updateElaborationRateLimiter,
  deleteElaborationRateLimiter,
  getElaborationRateLimiter,
  getLatestElaborationRateLimiter,
  listElaborationsRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { elaborationControllers } = require("@controllers/elaborations");
const { elaborationMiddlewares } = require("@middlewares/elaborations");
const { projectMiddlewares } = require("@middlewares/projects");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");

const {
  CREATE_ELABORATION,
  UPDATE_ELABORATION,
  DELETE_ELABORATION,
  GET_ELABORATION,
  GET_LATEST_ELABORATION,
  LIST_ELABORATIONS
} = ELABORATION_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order for WRITE operations (CREATE, UPDATE, DELETE):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Role-based authorization      – Verify stakeholder.role in allowed roles (PROJECT_OWNER)
//  4. Resource fetch middleware     – Fetch elaboration (except CREATE which doesn't need it)
//  5. Presence + Validation         – Required fields + field-level validation
//  6. Controller                    – Business logic
//
// Middleware chain order for READ operations (GET, GET_LATEST, LIST):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Resource fetch middleware     – Fetch elaboration (not needed for LIST)
//  4. Controller                    – Business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /projects/:projectId/elaborations
 * Create a new elaboration for a project.
 * Allowed roles: PROJECT_OWNER
 */
elaborationRouter.post(
  CREATE_ELABORATION,
  [
    ...baseAuthAdminMiddlewares,
    createElaborationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.createElaborationStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    elaborationMiddlewares.createElaborationPresenceMiddleware,
    elaborationMiddlewares.createElaborationValidationMiddleware
  ],
  elaborationControllers.createElaborationController
);

/**
 * PATCH /projects/:projectId/elaborations/:elaborationId
 * Update an elaboration's mode.
 * Allowed roles: PROJECT_OWNER
 */
elaborationRouter.patch(
  UPDATE_ELABORATION,
  [
    ...baseAuthAdminMiddlewares,
    updateElaborationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.updateElaborationStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    elaborationMiddlewares.fetchLatestNotFrozenElaborationMiddleware,
    elaborationMiddlewares.updateElaborationPresenceMiddleware,
    elaborationMiddlewares.updateElaborationValidationMiddleware
  ],
  elaborationControllers.updateElaborationController
);

/**
 * DELETE /projects/:projectId/elaborations/:elaborationId
 * Delete (soft delete) an elaboration.
 * Allowed roles: PROJECT_OWNER
 */
elaborationRouter.delete(
  DELETE_ELABORATION,
  [ 
    ...baseAuthAdminMiddlewares,
    deleteElaborationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.deleteElaborationStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    elaborationMiddlewares.fetchLatestNotFrozenElaborationMiddleware,
    elaborationMiddlewares.deleteElaborationPresenceMiddleware,
    elaborationMiddlewares.deleteElaborationValidationMiddleware
  ],
  elaborationControllers.deleteElaborationController
);

/**
 * GET /projects/:projectId/elaborations/:elaborationId
 * Retrieve a single elaboration by ID.
 * Allowed roles: All stakeholders (no role restriction)
 */
elaborationRouter.get(
  GET_ELABORATION,
  [
    ...baseAuthAdminMiddlewares,
    getElaborationRateLimiter,
    elaborationMiddlewares.fetchElaborationMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder
  ],
  elaborationControllers.getElaborationController
);

/**
 * GET /projects/:projectId/elaborations/latest
 * Retrieve the latest elaboration for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
elaborationRouter.get(
  GET_LATEST_ELABORATION,
  [
    ...baseAuthAdminMiddlewares,
    getLatestElaborationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    elaborationMiddlewares.fetchLatestAnyStatusElaborationMiddleware
  ],
  elaborationControllers.getLatestElaborationController
);

/**
 * GET /projects/:projectId/elaborations
 * List all elaborations for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
elaborationRouter.get(
  LIST_ELABORATIONS,
  [
    ...baseAuthAdminMiddlewares,
    listElaborationsRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder
  ],
  elaborationControllers.listElaborationsController
);

module.exports = { elaborationRouter };
