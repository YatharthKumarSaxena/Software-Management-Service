// routes/idea.routes.js

const express = require("express");
const ideaRouter = express.Router();

const { IDEAS_ROUTES } = require("@configs/uri.config");
const {
  createIdeaRateLimiter,
  updateIdeaRateLimiter,
  deleteIdeaRateLimiter,
  acceptIdeaRateLimiter,
  rejectIdeaRateLimiter,
  deferIdeaRateLimiter,
  reopenIdeaRateLimiter,
  getIdeaRateLimiter,
  listIdeasRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { ideaControllers } = require("@controllers/ideas");
const { ideaMiddlewares } = require("@middlewares/ideas");
const { projectMiddlewares } = require("@middlewares/projects");
const { baseAuthAdminMiddlewares ,baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");

const {
  CREATE_IDEA,
  UPDATE_IDEA,
  DELETE_IDEA,
  GET_IDEA,
  LIST_IDEAS,
  ACCEPT_IDEA,
  REJECT_IDEA,
  DEFER_IDEA,
  REOPEN_IDEA
} = IDEAS_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order for WRITE operations (CREATE, UPDATE, DELETE, STATUS):
//  1. baseAuthAdminMiddlewares   – User authentication
//  2. Rate limiter               – Per-user+device window
//  3. fetchProjectMiddleware     – Fetch project (if needed)
//  4. activeProjectGuardMiddleware – Ensure project is active
//  5. fetchIdeaMiddleware        – Fetch idea (for update/delete/status operations)
//  6. Presence + Validation      – Required fields + field-level validation
//  7. Controller                 – Business logic
//
// Middleware chain order for READ operations (GET, LIST):
//  1. baseAuthAdminMiddlewares   – User authentication
//  2. Rate limiter               – Per-user+device window
//  3. fetchProjectMiddleware     – Fetch project (if needed)
//  4. fetchIdeaMiddleware        – Fetch idea (for GET)
//  5. Controller                 – Business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /ideas/create/:projectId
 * Create a new idea for a project.
 */
ideaRouter.post(
  CREATE_IDEA,
  [
    ...baseAuthClientOrAdminMiddlewares,
    createIdeaRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    ideaMiddlewares.createIdeaPresenceMiddleware,
    ideaMiddlewares.createIdeaValidationMiddleware
  ],
  ideaControllers.createIdeaController
);

/**
 * PATCH /ideas/update/:ideaId
 * Update an idea's title and/or description.
 */
ideaRouter.patch(
  UPDATE_IDEA,
  [
    ...baseAuthClientOrAdminMiddlewares,
    updateIdeaRateLimiter,
    ideaMiddlewares.fetchIdeaMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    ideaMiddlewares.updateIdeaPresenceMiddleware,
    ideaMiddlewares.updateIdeaValidationMiddleware
  ],
  ideaControllers.updateIdeaController
);

/**
 * DELETE /ideas/delete/:ideaId
 * Delete (soft delete) an idea.
 */
ideaRouter.delete(
  DELETE_IDEA,
  [
    ...baseAuthClientOrAdminMiddlewares,
    deleteIdeaRateLimiter,
    ideaMiddlewares.fetchIdeaMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware
  ],
  ideaControllers.deleteIdeaController
);

/**
 * PATCH /ideas/accept/:ideaId
 * Accept an idea (change status from PENDING to ACCEPTED).
 */
ideaRouter.patch(
  ACCEPT_IDEA,
  [
    ...baseAuthAdminMiddlewares,
    acceptIdeaRateLimiter,
    ideaMiddlewares.fetchIdeaMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware
  ],
  ideaControllers.acceptIdeaController
);

/**
 * PATCH /ideas/reject/:ideaId
 * Reject an idea with reason (change status from PENDING to REJECTED).
 */
ideaRouter.patch(
  REJECT_IDEA,
  [
    ...baseAuthAdminMiddlewares,
    rejectIdeaRateLimiter,
    ideaMiddlewares.fetchIdeaMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    ideaMiddlewares.rejectIdeaPresenceMiddleware,
    ideaMiddlewares.rejectIdeaValidationMiddleware
  ],
  ideaControllers.rejectIdeaController
);

/**
 * PATCH /ideas/defer/:ideaId
 * Defer an idea with reason (change status from PENDING to DEFERRED).
 */
ideaRouter.patch(
  DEFER_IDEA,
  [
    ...baseAuthAdminMiddlewares,
    deferIdeaRateLimiter,
    ideaMiddlewares.fetchIdeaMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    ideaMiddlewares.deferIdeaPresenceMiddleware,
    ideaMiddlewares.deferIdeaValidationMiddleware
  ],
  ideaControllers.deferIdeaController
);

/**
 * PATCH /ideas/reopen/:ideaId
 * Reopen an idea (change status from REJECTED/DEFERRED back to PENDING).
 */
ideaRouter.patch(
  REOPEN_IDEA,
  [
    ...baseAuthAdminMiddlewares,
    reopenIdeaRateLimiter,
    ideaMiddlewares.fetchIdeaMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware
  ],
  ideaControllers.reopenIdeaController
);

/**
 * GET /ideas/get/:ideaId
 * Retrieve a single idea by ID.
 */
ideaRouter.get(
  GET_IDEA,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getIdeaRateLimiter,
    ideaMiddlewares.fetchIdeaMiddleware,
    projectMiddlewares.fetchProjectMiddleware
  ],
  ideaControllers.getIdeaController
);

/**
 * GET /ideas/list/:projectId
 * List all ideas for a project.
 */
ideaRouter.get(
  LIST_IDEAS,
  [
    ...baseAuthClientOrAdminMiddlewares,
    listIdeasRateLimiter,
    projectMiddlewares.fetchProjectMiddleware
  ],
  ideaControllers.listIdeasController
);

module.exports = { ideaRouter };
