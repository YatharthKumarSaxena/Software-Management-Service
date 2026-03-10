// routes/admin.routes.js

const express = require("express");
const adminRouter = express.Router();

const { ADMIN_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { apiAuthorizationMiddleware } = require("@middlewares/common/api-authorization.middleware");
const { adminMiddlewares } = require("@middlewares/admins");
const { createProjectRateLimiter, updateProjectRateLimiter } = require("@rate-limiters/general-api.rate-limiter");
const { createProjectController } = require("@controllers/projects/create-project.controller");
const { updateProjectController } = require("@controllers/projects/update-project.controller");

const { CREATE_PROJECT, UPDATE_PROJECT } = ADMIN_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares  – device check, JWT verify, fetch admin, status checks
//  2. Rate limiter               – per-user+device window
//  3. Presence middleware        – required fields in req.body
//  4. Validation middleware      – type / length / enum checks
//  5. Role-auth middleware       – admin.role must be in allowedRoles
//  6. Controller                 – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/admin/projects
 * Create a new project.
 * Allowed roles: CEO, Business Analyst
 */
adminRouter.post(
  CREATE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    createProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminCreateProject,
    adminMiddlewares.createProjectPresenceMiddleware,
    adminMiddlewares.createProjectValidationMiddleware
  ],
  createProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/projects/:projectId
 * Update an existing project.
 * Allowed roles: CEO, Business Analyst, Manager
 */
adminRouter.patch(
  UPDATE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    updateProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminUpdateProject,
    adminMiddlewares.updateProjectPresenceMiddleware,
    adminMiddlewares.updateProjectValidationMiddleware
  ],
  updateProjectController
);

module.exports = { adminRouter };
