const {
  createAdminRoleAuthMiddleware,
  createAdminRoleOrStakeholderAuthMiddleware
} = require("@middlewares/factory/role-authorization.middleware-factory");

const { ApiRolePermissions } = require("@configs/api-role-permissions.config");

// ─────────────────────────────────────────────────────────────────────────────
// Admin role-authorization middlewares
// ─────────────────────────────────────────────────────────────────────────────

const authorizeAdminCreateProject  = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.createProject);
const authorizeAdminUpdateProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.updateProject);
const authorizeAdminOnHoldProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.onHoldProject);
const authorizeAdminAbortProject    = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.abortProject);
const authorizeAdminCompleteProject = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.completeProject);
const authorizeAdminResumeProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.resumeProject);
const authorizeAdminDeleteProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.deleteProject);
const authorizeAdminArchiveProject  = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.archiveProject);
const authorizeAdminGetProject      = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.getProject);
const authorizeAdminGetProjects     = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.getProjects);
const authorizeAdminActivateProject = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.activateProject);

// ─────────────────────────────────────────────────────────────────────────────
// Stakeholder role-authorization middlewares
// ─────────────────────────────────────────────────────────────────────────────
const authorizeAdminCreateStakeholder = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.createStakeholder);
const authorizeAdminUpdateStakeholder = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.updateStakeholder);
const authorizeAdminDeleteStakeholder = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.deleteStakeholder);
const authorizeAdminGetStakeholder    = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.getStakeholder);
const authorizeAdminGetStakeholders   = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.getStakeholders);

const authorizeAdminListActivity       = createAdminRoleAuthMiddleware(ApiRolePermissions.activityTracker.listActivity);

// ─────────────────────────────────────────────────────────────────────────────
// Inception role-authorization middlewares
// ─────────────────────────────────────────────────────────────────────────────
const authorizeAdminGetInception    = createAdminRoleAuthMiddleware(ApiRolePermissions.inception.getInception);
const authorizeAdminListInceptions  = createAdminRoleAuthMiddleware(ApiRolePermissions.inception.listInceptions);
const authorizeAdminDeleteInception = createAdminRoleAuthMiddleware(ApiRolePermissions.inception.deleteInception);
const authorizeAdminGetLatestInception = createAdminRoleAuthMiddleware(ApiRolePermissions.inception.getLatestInception);

// ─────────────────────────────────────────────────────────────────────────────
// Combined: Role OR Stakeholder — for read/fetch endpoints
// Admin gets access if their role is authorized OR if they are a stakeholder
// of the relevant project (project-specific GET) / any project (list routes).
// ─────────────────────────────────────────────────────────────────────────────


const authorizeAdminGetProjectOrStakeholder    = createAdminRoleOrStakeholderAuthMiddleware(ApiRolePermissions.admin.getProject);
const authorizeAdminGetProjectsOrStakeholder   = createAdminRoleOrStakeholderAuthMiddleware(ApiRolePermissions.admin.getProjects);
const authorizeAdminGetStakeholderOrMember     = createAdminRoleOrStakeholderAuthMiddleware(ApiRolePermissions.stakeholder.getStakeholder);
const authorizeAdminGetStakeholdersOrMember    = createAdminRoleOrStakeholderAuthMiddleware(ApiRolePermissions.stakeholder.getStakeholders);

const adminApiAuthorizationMiddleware = {
  authorizeAdminCreateProject,
  authorizeAdminUpdateProject,
  authorizeAdminOnHoldProject,
  authorizeAdminAbortProject,
  authorizeAdminCompleteProject,
  authorizeAdminResumeProject,
  authorizeAdminDeleteProject,
  authorizeAdminArchiveProject,
  authorizeAdminGetProject,
  authorizeAdminGetProjects,
  authorizeAdminCreateStakeholder,
  authorizeAdminUpdateStakeholder,
  authorizeAdminDeleteStakeholder,
  authorizeAdminGetStakeholder,
  authorizeAdminGetStakeholders,
  // Combined role-or-stakeholder variants
  authorizeAdminGetProjectOrStakeholder,
  authorizeAdminGetProjectsOrStakeholder,
  authorizeAdminGetStakeholderOrMember,
  authorizeAdminGetStakeholdersOrMember,
  authorizeAdminActivateProject,
  authorizeAdminListActivity,
  // Inception middlewares
  authorizeAdminGetInception,
  authorizeAdminListInceptions,
  authorizeAdminDeleteInception,
  authorizeAdminGetLatestInception
}

module.exports = {
    adminApiAuthorizationMiddleware
};
