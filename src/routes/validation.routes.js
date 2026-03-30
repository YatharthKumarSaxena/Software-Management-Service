// routes/validation.routes.js

const express = require("express");
const validationRouter = express.Router();

const { VALIDATION_ROUTES } = require("@configs/uri.config");
const {
  createValidationRateLimiter,
  updateValidationRateLimiter,
  deleteValidationRateLimiter,
  freezeValidationRateLimiter,
  getValidationRateLimiter,
  getLatestValidationRateLimiter,
  listValidationsRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { validationControllers } = require("@controllers/validations");
const { validationMiddlewares } = require("@middlewares/validations");
const { projectMiddlewares } = require("@middlewares/projects");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { commonMiddlewares } = require("@/middlewares/common");

const {
  CREATE_VALIDATION,
  UPDATE_VALIDATION,
  DELETE_VALIDATION,
  GET_VALIDATION,
  GET_LATEST_VALIDATION,
  LIST_VALIDATIONS,
  FREEZE_VALIDATION
} = VALIDATION_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order for WRITE operations (CREATE, UPDATE, DELETE):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Role-based authorization      – Verify stakeholder.role in allowed roles (PROJECT_OWNER)
//  4. Resource fetch middleware     – Fetch validation (except CREATE which doesn't need it)
//  5. Presence + Validation         – Required fields + field-level validation
//  6. Controller                    – Business logic
//
// Middleware chain order for READ operations (GET, GET_LATEST, LIST):
//  1. checkClientIsStakeholder      – User authentication + project fetch + stakeholder check
//  2. Rate limiter                  – Per-user+device window
//  3. Resource fetch middleware     – Fetch validation (not needed for LIST)
//  4. Controller                    – Business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /projects/:projectId/validations
 * Create a new validation for a project.
 * Allowed roles: PROJECT_OWNER
 */
validationRouter.post(
  CREATE_VALIDATION,
  [
    ...baseAuthAdminMiddlewares,
    createValidationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.createValidationStakeholderRoleAccessMiddleware
  ],
  validationControllers.createValidationController
);

/**
 * PATCH /projects/:projectId/validations/:validationId
 * Update a validation's mode.
 * Allowed roles: PROJECT_OWNER
 */
validationRouter.patch(
  UPDATE_VALIDATION,
  [
    ...baseAuthAdminMiddlewares,
    updateValidationRateLimiter,
    validationMiddlewares.fetchLatestValidationMiddleware,
    commonMiddlewares.checkValidationNotFrozen,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.updateValidationStakeholderRoleAccessMiddleware
  ],
  validationControllers.updateValidationController
);

/**
 * DELETE /projects/:projectId/validations/:validationId
 * Delete (soft delete) a validation.
 * Allowed roles: PROJECT_OWNER
 */
validationRouter.delete(
  DELETE_VALIDATION,
  [ 
    ...baseAuthAdminMiddlewares,
    deleteValidationRateLimiter,
    validationMiddlewares.fetchLatestValidationMiddleware,
    commonMiddlewares.checkValidationNotFrozen,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.deleteValidationStakeholderRoleAccessMiddleware,
    validationMiddlewares.deleteValidationPresenceMiddleware,
    validationMiddlewares.deleteValidationValidationMiddleware
  ],
  validationControllers.deleteValidationController
);

/**
 * GET /projects/:projectId/validations/:validationId
 * Retrieve a single validation by ID.
 * Allowed roles: All stakeholders (no role restriction)
 */
validationRouter.get(
  GET_VALIDATION,
  [
    ...baseAuthAdminMiddlewares,
    getValidationRateLimiter,
    validationMiddlewares.fetchValidationMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  validationControllers.getValidationController
);

/**
 * GET /projects/:projectId/validations/latest
 * Retrieve the latest validation for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
validationRouter.get(
  GET_LATEST_VALIDATION,
  [
    ...baseAuthAdminMiddlewares,
    getLatestValidationRateLimiter,
    validationMiddlewares.fetchLatestValidationMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  validationControllers.getLatestValidationController
);

/**
 * GET /projects/:projectId/validations
 * List all validations for a project.
 * Allowed roles: All stakeholders (no role restriction)
 */
validationRouter.get(
  LIST_VALIDATIONS,
  [
    ...baseAuthAdminMiddlewares,
    listValidationsRateLimiter,
    projectMiddlewares.fetchProjectMiddleware
  ],
  validationControllers.listValidationsController
);

/**
 * PATCH /projects/:projectId/validations/freeze/:projectId
 * Freeze the latest validation for a project.
 * Allowed roles: PROJECT_OWNER
 */
validationRouter.patch(
  FREEZE_VALIDATION,
  [
    ...baseAuthAdminMiddlewares,
    freezeValidationRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.freezeValidationStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    validationMiddlewares.fetchLatestValidationMiddleware,
    commonMiddlewares.checkValidationNotFrozen
  ],
  validationControllers.freezeValidationController
);

module.exports = { validationRouter };
