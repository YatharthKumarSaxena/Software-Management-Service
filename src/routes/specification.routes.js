// routes/specification.routes.js

const express = require("express");
const specificationRouter = express.Router();

const { SPECIFICATION_ROUTES } = require("@configs/uri.config");
const {
  createSpecificationRateLimiter,
  updateSpecificationRateLimiter,
  deleteSpecificationRateLimiter,
  freezeSpecificationRateLimiter,
  getSpecificationRateLimiter,
  getLatestSpecificationRateLimiter,
  listSpecificationsRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { specificationControllers } = require("@controllers/specifications");
const { specificationMiddlewares } = require("@middlewares/specifications");
const { projectMiddlewares } = require("@middlewares/projects");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { commonMiddlewares } = require("@/middlewares/common");

const {
  CREATE_SPECIFICATION,
  UPDATE_SPECIFICATION,
  DELETE_SPECIFICATION,
  GET_SPECIFICATION,
  GET_LATEST_SPECIFICATION,
  LIST_SPECIFICATIONS,
  FREEZE_SPECIFICATION
} = SPECIFICATION_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order for WRITE operations (CREATE, UPDATE, DELETE):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Role-based authorization      – Verify stakeholder.role in allowed roles (PROJECT_OWNER)
//  4. Resource fetch middleware     – Fetch specification (except CREATE which doesn't need it)
//  5. Presence + Validation         – Required fields + field-level validation
//  6. Controller                    – Business logic
//
// Middleware chain order for READ operations (GET, GET_LATEST, LIST):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Resource fetch middleware     – Fetch specification (not needed for LIST)
//  4. Controller                    – Business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /projects/:projectId/specifications
 * Create a new specification for a project.
 * Allowed roles: PROJECT_OWNER
 */
specificationRouter.post(
  CREATE_SPECIFICATION,
  [
    ...baseAuthAdminMiddlewares,
    createSpecificationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.createSpecificationStakeholderRoleAccessMiddleware
  ],
  specificationControllers.createSpecificationController
);

/**
 * PATCH /projects/:projectId/specifications/:specificationId
 * Update a specification's mode.
 * Allowed roles: PROJECT_OWNER
 */
specificationRouter.patch(
  UPDATE_SPECIFICATION,
  [
    ...baseAuthAdminMiddlewares,
    updateSpecificationRateLimiter,
    specificationMiddlewares.fetchLatestSpecificationMiddleware,
    commonMiddlewares.checkSpecificationNotFrozen,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.updateSpecificationStakeholderRoleAccessMiddleware
  ],
  specificationControllers.updateSpecificationController
);

/**
 * DELETE /projects/:projectId/specifications/:specificationId
 * Delete (soft delete) a specification.
 * Allowed roles: PROJECT_OWNER
 */
specificationRouter.delete(
  DELETE_SPECIFICATION,
  [ 
    ...baseAuthAdminMiddlewares,
    deleteSpecificationRateLimiter,
    specificationMiddlewares.fetchLatestSpecificationMiddleware,
    commonMiddlewares.checkSpecificationNotFrozen,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.deleteSpecificationStakeholderRoleAccessMiddleware,
    specificationMiddlewares.deleteSpecificationPresenceMiddleware,
    specificationMiddlewares.deleteSpecificationValidationMiddleware
  ],
  specificationControllers.deleteSpecificationController
);

/**
 * GET /projects/:projectId/specifications/:specificationId
 * Retrieve a single specification by ID.
 * Allowed roles: All stakeholders (no role restriction)
 */
specificationRouter.get(
  GET_SPECIFICATION,
  [
    ...baseAuthAdminMiddlewares,
    getSpecificationRateLimiter,
    specificationMiddlewares.fetchSpecificationMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  specificationControllers.getSpecificationController
);

/**
 * GET /projects/:projectId/specifications/latest
 * Retrieve the latest specification for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
specificationRouter.get(
  GET_LATEST_SPECIFICATION,
  [
    ...baseAuthAdminMiddlewares,
    getLatestSpecificationRateLimiter,
    specificationMiddlewares.fetchLatestSpecificationMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  specificationControllers.getLatestSpecificationController
);

/**
 * GET /projects/:projectId/specifications
 * List all specifications for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
specificationRouter.get(
  LIST_SPECIFICATIONS,
  [
    ...baseAuthAdminMiddlewares,
    listSpecificationsRateLimiter,
    projectMiddlewares.fetchProjectMiddleware
  ],
  specificationControllers.listSpecificationsController
);

/**
 * PATCH /projects/:projectId/specifications/freeze/:projectId
 * Freeze the latest specification for a project.
 * Allowed roles: PROJECT_OWNER
 */
specificationRouter.patch(
  FREEZE_SPECIFICATION,
  [
    ...baseAuthAdminMiddlewares,
    freezeSpecificationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.freezeSpecificationStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    specificationMiddlewares.fetchLatestSpecificationMiddleware,
    commonMiddlewares.checkSpecificationNotFrozen
  ],
  specificationControllers.freezeSpecificationController
);

module.exports = { specificationRouter };
