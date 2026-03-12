// routes/client.routes.js

const express = require("express");
const clientRouter = express.Router();

const { CLIENT_ROUTES } = require("@/configs/uri.config");
const { baseAuthClientMiddlewares, checkClientIsStakeholder } = require("./middleware.gateway.routes");
const {
  clientGetProjectRateLimiter,
  clientListProjectsRateLimiter,
  clientGetStakeholderRateLimiter,
  clientListStakeholdersRateLimiter,
} = require("@rate-limiters/general-api.rate-limiter");

const { getProjectClientController }       = require("@controllers/clients/get-project-client.controller");
const { getProjectsClientController }      = require("@controllers/clients/list-projects-client.controller");
const { getStakeholderClientController }   = require("@controllers/clients/get-stakeholders-client.controller");
const { listStakeholdersClientController } = require("@controllers/clients/list-stakeholders-client.controller");

const {
  GET_PROJECT,
  LIST_PROJECTS,
  GET_STAKEHOLDER,
  LIST_STAKEHOLDERS,
} = CLIENT_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order (client routes):
//  1. baseAuthClientMiddlewares  – device check, JWT verify, fetch client, status checks
//  2. checkClientIsStakeholder   – (project routes) also fetches project + verifies membership
//  3. Rate limiter               – per-user+device window
//  4. Controller                 – business logic (restricted-field / enriched response)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /software-management-service/api/v1/clients/view-project/:projectId
 * Fetch a single project – client-safe restricted fields.
 * Client must be a stakeholder of the requested project.
 */
clientRouter.get(
  GET_PROJECT,
  [
    ...checkClientIsStakeholder,
    clientGetProjectRateLimiter,
  ],
  getProjectClientController
);

/**
 * GET /software-management-service/api/v1/clients/list-projects
 * Fetch paginated project list – client-safe restricted fields.
 * No deleted projects returned.
 */
clientRouter.get(
  LIST_PROJECTS,
  [
    ...baseAuthClientMiddlewares,
    clientListProjectsRateLimiter,
  ],
  getProjectsClientController
);

/**
 * GET /software-management-service/api/v1/clients/get-stakeholder/:stakeholderId
 * Fetch a single stakeholder enriched with resolved name.
 */
clientRouter.get(
  GET_STAKEHOLDER,
  [
    ...baseAuthClientMiddlewares,
    clientGetStakeholderRateLimiter,
  ],
  getStakeholderClientController
);

/**
 * GET /software-management-service/api/v1/clients/list-stakeholders
 * Fetch paginated stakeholder list enriched with resolved names.
 * Supports filters: projectId, role, stakeholderId, page, limit.
 */
clientRouter.get(
  LIST_STAKEHOLDERS,
  [
    ...baseAuthClientMiddlewares,
    clientListStakeholdersRateLimiter,
  ],
  listStakeholdersClientController
);

module.exports = { clientRouter };
