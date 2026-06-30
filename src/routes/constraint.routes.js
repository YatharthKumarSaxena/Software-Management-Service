// routes/constraint.routes.js

const express = require("express");
const constraintRouter = express.Router();

const { CONSTRAINT_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { constraintControllers } = require("@controllers/constraints");
const { constraintMiddlewares } = require("@/middlewares/constraints");
const { projectMiddlewares } = require("@/middlewares/projects");
const { hlfMiddlewares } = require("@/middlewares/high-level-features");
const { inceptionMiddlewares } = require("@/middlewares/inceptions");
const {
  createConstraintRateLimiter,
  updateConstraintRateLimiter,
  deleteConstraintRateLimiter,
  getConstraintRateLimiter,
  listConstraintsRateLimiter,
  linkConstraintToHlfRateLimiter,
  unlinkConstraintToHlfRateLimiter
} = require("@/rate-limiters/general-api.rate-limiter");
const { commonMiddlewares } = require("@/middlewares/common");
const { getDataMiddleware, listDataMiddleware } = require("@middlewares/common/fetch-data.middleware");

const {
  CREATE_CONSTRAINT,
  UPDATE_CONSTRAINT,
  DELETE_CONSTRAINT,
  GET_CONSTRAINT,
  LIST_CONSTRAINTS,
  LINK_CONSTRAINT_TO_HLF,
  UNLINK_CONSTRAINT_TO_HLF
} = CONSTRAINT_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares       – device check, JWT verify, fetch admin, status checks
//  2. Rate limiter                   – per-user-per-device throttle
//  3. fetchProjectMiddleware         – load project from params/body  (CREATE / LIST)
//     OR fetchConstraintMiddleware   – load constraint + attach projectId (UPDATE / DELETE / GET)
//  4. checkUserIsStakeholder         – verify admin is stakeholder of project
//  5. activeProjectGuardMiddleware   – verify project is not DRAFT
//  6. fetchLatestOpenInception       – load inception document (CREATE)
//     OR fetchLatestNotFrozenInception – (UPDATE / DELETE)
//  7. Presence middleware            – required fields in req.body
//  8. Validation middleware          – type / length / enum checks
//  9. Controller                     – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/constraints/create/:projectId
 * Create a new constraint for the project's current inception phase.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project
 */
constraintRouter.post(
  CREATE_CONSTRAINT,
  [
    ...baseAuthAdminMiddlewares,
    createConstraintRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,
    inceptionMiddlewares.fetchLatestOpenInceptionMiddleware,
    constraintMiddlewares.createConstraintPresenceMiddleware,
    constraintMiddlewares.createConstraintValidationMiddleware,
  ],
  constraintControllers.createConstraintController
);

/**
 * PATCH /software-management-service/api/v1/constraints/update/:constraintId
 * Update an existing constraint.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project, project is not DRAFT
 */
constraintRouter.patch(
  UPDATE_CONSTRAINT,
  [
    ...baseAuthAdminMiddlewares,
    updateConstraintRateLimiter,
    constraintMiddlewares.fetchConstraintMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,
    inceptionMiddlewares.fetchLatestNotFrozenInceptionMiddleware,
    constraintMiddlewares.updateConstraintPresenceMiddleware,
    constraintMiddlewares.updateConstraintValidationMiddleware,
  ],
  constraintControllers.updateConstraintController
);

/**
 * DELETE /software-management-service/api/v1/constraints/delete/:constraintId
 * Soft-delete a constraint. Optional deletion reason can be provided.
 * Allowed roles: CEO, Manager
 * Requires: admin is a stakeholder of the project, project is not DRAFT
 */
constraintRouter.delete(
  DELETE_CONSTRAINT,
  [
    ...baseAuthAdminMiddlewares,
    deleteConstraintRateLimiter,
    constraintMiddlewares.fetchConstraintMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,
    inceptionMiddlewares.fetchLatestNotFrozenInceptionMiddleware,
    constraintMiddlewares.deleteConstraintPresenceMiddleware,
    constraintMiddlewares.deleteConstraintValidationMiddleware
  ],
  constraintControllers.deleteConstraintController
);

/**
 * GET /software-management-service/api/v1/constraints/get/:constraintId
 * Fetch a single constraint. Accessible by both admin and client stakeholders.
 */
constraintRouter.get(
  GET_CONSTRAINT,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getConstraintRateLimiter,
    getDataMiddleware,
    constraintMiddlewares.fetchConstraintMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder
  ],
  constraintControllers.getConstraintController
);

/**
 * GET /software-management-service/api/v1/constraints/list/:projectId
 * List all constraints for a project's inception. Accessible by both admin and client stakeholders.
 */
constraintRouter.get(
  LIST_CONSTRAINTS,
  [
    ...baseAuthClientOrAdminMiddlewares,
    listConstraintsRateLimiter,
    listDataMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    inceptionMiddlewares.fetchLatestAnyStatusInceptionMiddleware
  ],
  constraintControllers.listConstraintsController
);

/**
 * PATCH /software-management-service/api/v1/constraints/link/:constraintId/:hlfId
 * Link a constraint to a high-level feature.
 * category is automatically set to LOCAL — no user input required.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project
 */
constraintRouter.patch(
  LINK_CONSTRAINT_TO_HLF,
  [
    ...baseAuthAdminMiddlewares,
    linkConstraintToHlfRateLimiter,
    constraintMiddlewares.fetchConstraintMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    hlfMiddlewares.fetchHlfMiddleware,
    inceptionMiddlewares.fetchLatestNotFrozenInceptionMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware
  ],
  constraintControllers.linkConstraintToHlfController
);

/**
 * PATCH /software-management-service/api/v1/constraints/unlink/:constraintId
 * Unlink a constraint from a high-level feature.
 * category is automatically reset to GLOBAL — no user input required.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project
 */
constraintRouter.patch(
  UNLINK_CONSTRAINT_TO_HLF,
  [
    ...baseAuthAdminMiddlewares,
    unlinkConstraintToHlfRateLimiter,
    constraintMiddlewares.fetchConstraintMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    inceptionMiddlewares.fetchLatestNotFrozenInceptionMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware
  ],
  constraintControllers.unlinkConstraintToHlfController
);

module.exports = { constraintRouter };
