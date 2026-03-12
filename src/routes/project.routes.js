// routes/admin.routes.js

const express = require("express");
const projectRouter = express.Router();

const { PROJECT_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { adminApiAuthorizationMiddleware: apiAuthorizationMiddleware } = require("@/middlewares/admins/admin-api-authorization.middleware");
const {
  createProjectRateLimiter,
  updateProjectRateLimiter,
  onHoldProjectRateLimiter,
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
const { onHoldProjectController }           = require("@controllers/projects/on-hold-project.controller");
const { abortProjectController }            = require("@controllers/projects/abort-project.controller");
const { completeProjectController }         = require("@controllers/projects/complete-project.controller");
const { resumeProjectController }           = require("@controllers/projects/resume-project.controller");
const { deleteProjectController }           = require("@controllers/projects/delete-project.controller");
const { archiveProjectController }          = require("@controllers/projects/archive-project.controller");
const { getProjectAdminController }         = require("@controllers/projects/get-project-admin.controller");
const { listProjectsAdminController: getProjectsAdminController } = require("@/controllers/projects/list-projects-admin.controller");
const { fetchProjectMiddleware } = require("@/middlewares/projects/fetch-project.middleware");
const { projectMiddlewares } = require("@/middlewares/projects");

const {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  ABORT_PROJECT,
  COMPLETE_PROJECT,
  RESUME_PROJECT,
  DELETE_PROJECT,
  ARCHIVE_PROJECT,
  GET_PROJECT,
  LIST_PROJECTS: GET_PROJECTS,
} = PROJECT_ROUTES;

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
projectRouter.post(
  CREATE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    createProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminCreateProject,
    projectMiddlewares.createProjectPresenceMiddleware,
    projectMiddlewares.createProjectValidationMiddleware,
  ],
  createProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/update-project/:projectId
 * Update core content fields of an existing project.
 * Allowed roles: CEO, Business Analyst, Manager
 */
projectRouter.patch(
  UPDATE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    updateProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminUpdateProject,
    fetchProjectMiddleware,
    projectMiddlewares.updateProjectPresenceMiddleware,
    projectMiddlewares.updateProjectValidationMiddleware,
  ],
  updateProjectController
);

/**
 * PATCH /software-management-service/api/v1/projects/on-hold/:projectId
 * Put an active project on hold.
 * Allowed roles: CEO, Manager
 */
projectRouter.patch(
  `/on-hold/:projectId`,
  [
    ...baseAuthAdminMiddlewares,
    onHoldProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminOnHoldProject,
    fetchProjectMiddleware,
    projectMiddlewares.onHoldProjectPresenceMiddleware,
    projectMiddlewares.onHoldProjectValidationMiddleware,
  ],
  onHoldProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/abort-project/:projectId
 * Abort an active/draft/on-hold project.
 * Allowed roles: CEO, Manager
 */
projectRouter.patch(
  ABORT_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    abortProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminAbortProject,
    fetchProjectMiddleware,
    projectMiddlewares.abortProjectPresenceMiddleware,
    projectMiddlewares.abortProjectValidationMiddleware,
  ],
  abortProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/complete-project/:projectId
 * Mark an active project as completed.
 * Allowed roles: CEO, Manager
 */
projectRouter.patch(
  COMPLETE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    completeProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminCompleteProject,
    fetchProjectMiddleware,
    projectMiddlewares.completeProjectPresenceMiddleware,
    projectMiddlewares.completeProjectValidationMiddleware,
  ],
  completeProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/resume-project/:projectId
 * Resume an on-hold or aborted project.
 * Allowed roles: CEO, Manager
 */
projectRouter.patch(
  RESUME_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    resumeProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminResumeProject,
    fetchProjectMiddleware,
    projectMiddlewares.resumeProjectPresenceMiddleware,
    projectMiddlewares.resumeProjectValidationMiddleware,
  ],
  resumeProjectController
);

/**
 * DELETE /software-management-service/api/v1/admin/delete-project/:projectId
 * Soft-delete a project (one-time, irreversible).
 * Allowed roles: CEO only
 */
projectRouter.delete(
  DELETE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    deleteProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminDeleteProject,
    fetchProjectMiddleware,
    projectMiddlewares.deleteProjectPresenceMiddleware,
    projectMiddlewares.deleteProjectValidationMiddleware,
  ],
  deleteProjectController
);

/**
 * PATCH /software-management-service/api/v1/admin/archive-project/:projectId
 * Archive a completed project (irreversible; archived projects can be deleted).
 * Allowed roles: CEO, Manager
 */
projectRouter.patch(
  ARCHIVE_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    archiveProjectRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminArchiveProject,
    fetchProjectMiddleware
  ],
  archiveProjectController
);

// ─────────────────────────────────────────────────────────────────────────────
// Read / Fetch routes
// No body presence / validation middleware needed (read-only, no body).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /software-management-service/api/v1/projects/get/:projectId
 * Fetch full details of a single project (admin view — all fields).
 * Allowed roles: All admin roles OR if admin is a stakeholder of this project
 */
projectRouter.get(
  GET_PROJECT,
  [
    ...baseAuthAdminMiddlewares,
    getProjectRateLimiter,
    fetchProjectMiddleware,
    apiAuthorizationMiddleware.authorizeAdminGetProjectOrStakeholder,
  ],
  getProjectAdminController
);

/**
 * GET /software-management-service/api/v1/projects/list
 * Fetch paginated project list with optional filters (admin view — all fields).
 * Allowed roles: All admin roles OR if admin is a stakeholder of any project
 */
projectRouter.get(
  GET_PROJECTS,
  [
    ...baseAuthAdminMiddlewares,
    getProjectsRateLimiter,
    apiAuthorizationMiddleware.authorizeAdminGetProjectsOrStakeholder,
  ],
  getProjectsAdminController
);

module.exports = { projectRouter };
