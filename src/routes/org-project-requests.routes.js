// routes/org-project-requests.routes.js

const express = require("express");
const orgProjectRequestsRouter = express.Router();

const { ORG_PROJECT_REQUEST_ROUTES } = require("@/configs/uri.config");
const {
  createOrgProjectRequestRateLimiter,
  getOrgProjectRequestRateLimiter,
  listMyOrgProjectRequestsRateLimiter,
  listProjectOrgRequestsRateLimiter,
  updateOrgProjectRequestRateLimiter,
  withdrawOrgProjectRequestRateLimiter,
  approveOrgProjectRequestRateLimiter,
  rejectOrgProjectRequestRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { orgProjectRequestControllers } = require("@controllers/org-project-requests");
const { orgProjectRequestValidationMiddlewares, presenceMiddlewares, fetchOrgProjectRequestMiddleware } = require("@middlewares/org-project-requests");
const { baseAuthClientMiddlewares } = require("./middleware.gateway.routes");

const {
  CREATE_ORG_PROJECT_REQUEST,
  GET_ORG_PROJECT_REQUEST,
  LIST_MY_ORG_PROJECT_REQUESTS,
  LIST_PROJECT_ORG_REQUESTS,
  UPDATE_ORG_PROJECT_REQUEST,
  WITHDRAW_ORG_PROJECT_REQUEST,
  APPROVE_ORG_PROJECT_REQUEST,
  REJECT_ORG_PROJECT_REQUEST
} = ORG_PROJECT_REQUEST_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order for WRITE operations (CREATE, UPDATE, APPROVE, REJECT, WITHDRAW):
//  1. baseAuthClientMiddlewares    – Client authentication
//  2. Rate limiter                 – Per-user+device window
//  3. Resource fetch middleware    – Fetch org project request (except CREATE which doesn't need it)
//  4. Validation middlewares       – Field-level validation
//  5. Controller                   – Business logic
//
// Middleware chain order for READ operations (GET, LIST):
//  1. baseAuthClientMiddlewares    – Client authentication
//  2. Rate limiter                 – Per-user+device window
//  3. Resource fetch middleware    – Fetch single request (for GET)
//  4. Controller                   – Business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /org-project-requests
 * Create a new org project request to join an organization's project
 * Allowed: Clients
 */
orgProjectRequestsRouter.post(
  CREATE_ORG_PROJECT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    createOrgProjectRequestRateLimiter,
    presenceMiddlewares.createOrgProjectRequestPresenceMiddleware,
    orgProjectRequestValidationMiddlewares.createOrgProjectRequestValidationMiddleware
  ],
  orgProjectRequestControllers.createOrgProjectRequestController
);

/**
 * GET /org-project-requests/:requestId
 * Retrieve a single org project request by ID
 * Allowed: Client who made request or Project Manager
 */
orgProjectRequestsRouter.get(
  GET_ORG_PROJECT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    getOrgProjectRequestRateLimiter,
    fetchOrgProjectRequestMiddleware
  ],
  orgProjectRequestControllers.getOrgProjectRequestController
);

/**
 * GET /org-project-requests
 * List all org project requests made by the authenticated client
 * Allowed: Clients
 */
orgProjectRequestsRouter.get(
  LIST_MY_ORG_PROJECT_REQUESTS,
  [
    ...baseAuthClientMiddlewares,
    listMyOrgProjectRequestsRateLimiter
  ],
  orgProjectRequestControllers.listMyOrgProjectRequestsController
);

/**
 * PATCH /org-project-requests/:requestId
 * Update an org project request (client only, only when PENDING)
 * Allowed: Client who made request
 */
orgProjectRequestsRouter.patch(
  UPDATE_ORG_PROJECT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    updateOrgProjectRequestRateLimiter,
    fetchOrgProjectRequestMiddleware,
    presenceMiddlewares.updateOrgProjectRequestPresenceMiddleware,
    orgProjectRequestValidationMiddlewares.updateOrgProjectRequestValidationMiddleware
  ],
  orgProjectRequestControllers.updateOrgProjectRequestController
);

/**
 * PATCH /org-project-requests/:requestId/withdraw
 * Withdraw an org project request (client only, only when PENDING)
 * Allowed: Client who made request
 */
orgProjectRequestsRouter.patch(
  WITHDRAW_ORG_PROJECT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    withdrawOrgProjectRequestRateLimiter,
    fetchOrgProjectRequestMiddleware
  ],
  orgProjectRequestControllers.withdrawOrgProjectRequestController
);

/**
 * PATCH /org-project-requests/:requestId/approve
 * Approve an org project request
 * Allowed: Project Manager / Admin
 */
orgProjectRequestsRouter.patch(
  APPROVE_ORG_PROJECT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    approveOrgProjectRequestRateLimiter,
    fetchOrgProjectRequestMiddleware,
    presenceMiddlewares.approveOrgProjectRequestPresenceMiddleware,
    orgProjectRequestValidationMiddlewares.approveOrgProjectRequestValidationMiddleware
  ],
  orgProjectRequestControllers.approveOrgProjectRequestController
);

/**
 * PATCH /org-project-requests/:requestId/reject
 * Reject an org project request
 * Allowed: Project Manager / Admin
 */
orgProjectRequestsRouter.patch(
  REJECT_ORG_PROJECT_REQUEST,
  [
    ...baseAuthClientMiddlewares,
    rejectOrgProjectRequestRateLimiter,
    fetchOrgProjectRequestMiddleware,
    presenceMiddlewares.rejectOrgProjectRequestPresenceMiddleware,
    orgProjectRequestValidationMiddlewares.rejectOrgProjectRequestValidationMiddleware
  ],
  orgProjectRequestControllers.rejectOrgProjectRequestController
);

/**
 * GET /org-project-requests/by-project/:projectId
 * List all org project requests for a specific project
 * Allowed: Project Manager / Admin
 */
orgProjectRequestsRouter.get(
  LIST_PROJECT_ORG_REQUESTS,
  [
    ...baseAuthClientMiddlewares,
    listProjectOrgRequestsRateLimiter
  ],
  orgProjectRequestControllers.listProjectOrgRequestsController
);

module.exports = { orgProjectRequestsRoutes: orgProjectRequestsRouter };
