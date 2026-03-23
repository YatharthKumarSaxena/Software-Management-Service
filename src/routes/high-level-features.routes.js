// routes/high-level-features.routes.js

const express = require("express");
const hlfRouter = express.Router();

const { HLF_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { hlfControllers } = require("@controllers/high-level-features");
const { hlfMiddlewares } = require("@/middlewares/high-level-features");
const { projectMiddlewares } = require("@/middlewares/projects");
const { commonMiddlewares } = require("@/middlewares/common");

const {
  CREATE_HLF,
  UPDATE_HLF,
  DELETE_HLF,
  GET_HLF,
  LIST_HLF
} = HLF_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares       – device check, JWT verify, fetch admin, status checks
//  2. fetchProjectMiddleware         – load project from params/body
//  3. fetchInceptionFromProject      – load inception for project
//  4. checkUserIsStakeholder         – verify admin is stakeholder of project
//  5. fetchHlfMiddleware             – (update/delete) load HLF
//  6. activeProjectGuardMiddleware   – verify project is not DRAFT
//  7. Presence middleware            – required fields in req.body
//  8. Validation middleware          – type / length / enum checks
//  9. Controller                     – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/high-level-features/create/:projectId
 * Create a new high-level feature for the project's current inception phase.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project
 */
hlfRouter.post(
  CREATE_HLF,
  [
    ...baseAuthAdminMiddlewares,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    hlfMiddlewares.fetchInceptionFromProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    hlfMiddlewares.createHlfPresenceMiddleware,
    hlfMiddlewares.createHlfValidationMiddleware,
  ],
  hlfControllers.createHlfController
);

/**
 * PATCH /software-management-service/api/v1/high-level-features/update/:hlfId
 * Update an existing high-level feature.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project, project is not DRAFT
 */
hlfRouter.patch(
  UPDATE_HLF,
  [
    ...baseAuthAdminMiddlewares,
    hlfMiddlewares.fetchHlfMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    hlfMiddlewares.updateHlfPresenceMiddleware,
    hlfMiddlewares.updateHlfValidationMiddleware,
  ],
  hlfControllers.updateHlfController
);

/**
 * DELETE /software-management-service/api/v1/high-level-features/delete/:hlfId
 * Soft-delete a high-level feature. Optional deletion reason can be provided.
 * Allowed roles: CEO, Manager
 * Requires: admin is a stakeholder of the project, project is not DRAFT
 */
hlfRouter.delete(
  DELETE_HLF,
  [
    ...baseAuthAdminMiddlewares,
    hlfMiddlewares.fetchHlfMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    hlfMiddlewares.deleteHlfValidationMiddleware,
  ],
  hlfControllers.deleteHlfController
);

/**
 * GET /software-management-service/api/v1/high-level-features/get/:hlfId
 * Fetch a single high-level feature. Accessible by both admin and client stakeholders.
 */
hlfRouter.get(
  GET_HLF,
  [
    ...baseAuthClientOrAdminMiddlewares,
    hlfMiddlewares.fetchHlfMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
  ],
  hlfControllers.getHlfController
);

/**
 * GET /software-management-service/api/v1/high-level-features/list/:projectId
 * List all high-level features for a project's inception. Accessible by both admin and client stakeholders.
 */
hlfRouter.get(
  LIST_HLF,
  [
    ...baseAuthClientOrAdminMiddlewares,
    projectMiddlewares.fetchProjectMiddleware,
    hlfMiddlewares.fetchInceptionFromProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
  ],
  hlfControllers.listHlfController
);

module.exports = { hlfRouter };
