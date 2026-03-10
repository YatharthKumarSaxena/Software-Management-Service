// routes/admin.routes.js

const express = require("express");
const adminRouter = express.Router();

const { ADMIN_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { apiAuthorizationMiddleware } = require("@middlewares/common/api-authorization.middleware");
const { adminMiddlewares } = require("@middlewares/admins");
const {
  createProjectRateLimiter,
  updateProjectRateLimiter,
  abortProjectRateLimiter,
  completeProjectRateLimiter,
  resumeProjectRateLimiter,
  deleteProjectRateLimiter,
  archiveProjectRateLimiter,
  getProjectRateLimiter,
  getProjectsRateLimiter,
} = require("@rate-limiters/general-api.rate-limiter");

const { createProjectController }           = require("@controllers/projects/create-project.controller");
const { updateProjectController }           = require("@controllers/projects/update-project.controller");
const { abortProjectController }            = require("@controllers/projects/abort-project.controller");
const { completeProjectController }         = require("@controllers/projects/complete-project.controller");
const { resumeProjectController }           = require("@controllers/projects/resume-project.controller");
const { deleteProjectController }           = require("@controllers/projects/delete-project.controller");
const { archiveProjectController }          = require("@controllers/projects/archive-project.controller");
const { getProjectAdminController }         = require("@controllers/projects/get-project-admin.controller");
const { getProjectsAdminController }        = require("@controllers/projects/get-projects-admin.controller");
const { getProjectClientController }        = require("@controllers/projects/get-project-client.controller");
const { getProjectsClientController }       = require("@controllers/projects/get-projects-client.controller");

const {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  ABORT_PROJECT,
  COMPLETE_PROJECT,
  RESUME_PROJECT,
  DELETE_PROJECT,
  ARCHIVE_PROJECT,
  GET_PROJECT,
  GET_PROJECTS,
} = ADMIN_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares  – device check, JWT verify, fetch admin, status checks
//  2. Rate limiter               – per-user+device window
//  3. Role-auth middleware       – admin.role must be in allowedRoles
//  4. Presence middleware        – required fields in req.body
//  5. Validation middleware      – type / length / enum checks
//  6. Controller                 – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/admin/create-project
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
    adminMiddlewares.createProjectValidationMiddleware,
  ],
  createProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/update-project/:projectId
 * Update core content fields of an existing project.
 * Allowed roles: CEO, Business Analyst, Manager
 */
adminRouter.patch(
  UPDATE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    updateProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminUpdateProject,
    adminMiddlewares.updateProjectPresenceMiddleware,
    adminMiddlewares.updateProjectValidationMiddleware,
  ],
  updateProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/abort-project/:projectId
 * Abort an active/draft/on-hold project.
 * Allowed roles: CEO, Manager
 */
adminRouter.patch(
  ABORT_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    abortProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminAbortProject,
    adminMiddlewares.abortProjectPresenceMiddleware,
    adminMiddlewares.abortProjectValidationMiddleware,
  ],
  abortProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/complete-project/:projectId
 * Mark an active project as completed.
 * Allowed roles: CEO, Manager
 */
adminRouter.patch(
  COMPLETE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    completeProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminCompleteProject,
    adminMiddlewares.completeProjectPresenceMiddleware,
    adminMiddlewares.completeProjectValidationMiddleware,
  ],
  completeProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/resume-project/:projectId
 * Resume an on-hold or aborted project.
 * Allowed roles: CEO, Manager
 */
adminRouter.patch(
  RESUME_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    resumeProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminResumeProject,
    adminMiddlewares.resumeProjectPresenceMiddleware,
    adminMiddlewares.resumeProjectValidationMiddleware,
  ],
  resumeProjectController
);

/**
 * DELETE /software-management-service/api/v1/admin/delete-project/:projectId
 * Soft-delete a project (one-time, irreversible).
 * Allowed roles: CEO only
 */
adminRouter.delete(
  DELETE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    deleteProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminDeleteProject,
    adminMiddlewares.deleteProjectPresenceMiddleware,
    adminMiddlewares.deleteProjectValidationMiddleware,
  ],
  deleteProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/archive-project/:projectId
 * Archive a completed project (irreversible; archived projects can be deleted).
 * Allowed roles: CEO, Manager
 */
adminRouter.patch(
  ARCHIVE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    archiveProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminArchiveProject,
  ],
  archiveProjectController
);

// ─────────────────────────────────────────────────────────────────────────────
// Read / Fetch routes
// No body presence / validation middleware needed (read-only, no body).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /software-management-service/api/v1/admin/get-project/:projectId
 * Fetch full details of a single project (admin view — all fields).
 * Allowed roles: All admin roles
 */
adminRouter.get(
  GET_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    getProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminGetProject,
  ],
  getProjectAdminController
);

/**
 * GET /software-management-service/api/v1/admin/get-projects
 * Fetch paginated project list with optional filters (admin view — all fields).
 * Allowed roles: All admin roles
 */
adminRouter.get(
  GET_PROJECTS,
  [
    ...baseAuthAdminMiddlewares,
    getProjectsRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminGetProjects,
  ],
  getProjectsAdminController
);

/**
 * GET /software-management-service/api/v1/admin/get-project-client/:projectId
 * Fetch a single project in client-safe view (restricted fields, no audit data).
 * Allowed roles: All admin roles
 */
adminRouter.get(
  `/get-project-client/:projectId`,
  [
    ...baseAuthAdminMiddlewares,
    getProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminGetProject,
  ],
  getProjectClientController
);

/**
 * GET /software-management-service/api/v1/admin/get-projects-client
 * Fetch paginated projects in client-safe view (restricted fields, no deleted).
 * Allowed roles: All admin roles
 */
adminRouter.get(
  `/get-projects-client`,
  [
    ...baseAuthAdminMiddlewares,
    getProjectsRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminGetProjects,
  ],
  getProjectsClientController
);

module.exports = { adminRouter };
