// routes/elicitation.routes.js

const express = require("express");
const elicitationRouter = express.Router();

const { ELICITATION_ROUTES } = require("@configs/uri.config");
const {
  createElicitationRateLimiter,
  updateElicitationRateLimiter,
  deleteElicitationRateLimiter,
  freezeElicitationRateLimiter,
  getElicitationRateLimiter,
  getLatestElicitationRateLimiter,
  listElicitationsRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { elicitationControllers } = require("@controllers/elicitations");
const { elicitationMiddlewares } = require("@middlewares/elicitations");
const { projectMiddlewares } = require("@middlewares/projects");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { commonMiddlewares } = require("@/middlewares/common");

const {
  CREATE_ELICITATION,
  UPDATE_ELICITATION,
  DELETE_ELICITATION,
  GET_ELICITATION,
  GET_LATEST_ELICITATION,
  LIST_ELICITATIONS,
  FREEZE_ELICITATION
} = ELICITATION_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order for WRITE operations (CREATE, UPDATE, DELETE):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Role-based authorization      – Verify stakeholder.role in allowed roles (PROJECT_OWNER)
//  4. Resource fetch middleware     – Fetch elicitation (except CREATE which doesn't need it)
//  5. Presence + Validation         – Required fields + field-level validation
//  6. Controller                    – Business logic
//
// Middleware chain order for READ operations (GET, GET_LATEST, LIST):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Resource fetch middleware     – Fetch elicitation (not needed for LIST)
//  4. Controller                    – Business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /projects/:projectId/elicitations
 * Create a new elicitation for a project.
 * Allowed roles: PROJECT_OWNER
 */
elicitationRouter.post(
  CREATE_ELICITATION,
  [
    ...baseAuthAdminMiddlewares,
    createElicitationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.createElicitationStakeholderRoleAccessMiddleware,
    elicitationMiddlewares.createElicitationPresenceMiddleware,
    elicitationMiddlewares.createElicitationValidationMiddleware
  ],
  elicitationControllers.createElicitationController
);

/**
 * PATCH /projects/:projectId/elicitations/:elicitationId
 * Update an elicitation's mode.
 * Allowed roles: PROJECT_OWNER
 */
elicitationRouter.patch(
  UPDATE_ELICITATION,
  [
    ...baseAuthAdminMiddlewares,
    updateElicitationRateLimiter,
    elicitationMiddlewares.fetchLatestElicitationMiddleware,
    commonMiddlewares.checkElicitationNotFrozen,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.updateElicitationStakeholderRoleAccessMiddleware,
    elicitationMiddlewares.updateElicitationPresenceMiddleware,
    elicitationMiddlewares.updateElicitationValidationMiddleware
  ],
  elicitationControllers.updateElicitationController
);

/**
 * DELETE /projects/:projectId/elicitations/:elicitationId
 * Delete (soft delete) an elicitation.
 * Allowed roles: PROJECT_OWNER
 */
elicitationRouter.delete(
  DELETE_ELICITATION,
  [ 
    ...baseAuthAdminMiddlewares,
    deleteElicitationRateLimiter,
    elicitationMiddlewares.fetchLatestElicitationMiddleware,
    commonMiddlewares.checkElicitationNotFrozen,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.deleteElicitationStakeholderRoleAccessMiddleware,
    elicitationMiddlewares.deleteElicitationPresenceMiddleware,
    elicitationMiddlewares.deleteElicitationValidationMiddleware
  ],
  elicitationControllers.deleteElicitationController
);

/**
 * GET /projects/:projectId/elicitations/:elicitationId
 * Retrieve a single elicitation by ID.
 * Allowed roles: All stakeholders (no role restriction)
 */
elicitationRouter.get(
  GET_ELICITATION,
  [
    ...baseAuthAdminMiddlewares,
    getElicitationRateLimiter,
    elicitationMiddlewares.fetchElicitationMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  elicitationControllers.getElicitationController
);

/**
 * GET /projects/:projectId/elicitations/latest
 * Retrieve the latest elicitation for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
elicitationRouter.get(
  GET_LATEST_ELICITATION,
  [
    ...baseAuthAdminMiddlewares,
    getLatestElicitationRateLimiter,
    elicitationMiddlewares.fetchLatestElicitationMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  elicitationControllers.getLatestElicitationController
);

/**
 * GET /projects/:projectId/elicitations
 * List all elicitations for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
elicitationRouter.get(
  LIST_ELICITATIONS,
  [
    ...baseAuthAdminMiddlewares,
    listElicitationsRateLimiter,
    projectMiddlewares.fetchProjectMiddleware
  ],
  elicitationControllers.listElicitationsController
);

/**
 * PATCH /projects/:projectId/elicitations/freeze/:projectId
 * Freeze the latest elicitation for a project.
 * Allowed roles: PROJECT_OWNER
 */
elicitationRouter.patch(
  FREEZE_ELICITATION,
  [
    ...baseAuthAdminMiddlewares,
    freezeElicitationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.freezeElicitationStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    elicitationMiddlewares.fetchLatestElicitationMiddleware,
    commonMiddlewares.checkElicitationNotFrozen
  ],
  elicitationControllers.freezeElicitationController
);

module.exports = { elicitationRouter };
