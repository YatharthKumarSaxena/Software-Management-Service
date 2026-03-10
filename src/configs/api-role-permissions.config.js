// configs/api-role-permissions.config.js

const { AdminRoleTypes, ClientRoleTypes } = require("./enums.config");

/**
 * Maps each API operation to the roles permitted to perform it.
 *
 * Structure:
 *   admin  → roles taken from AdminRoleTypes  (checked against req.admin.role)
 *   client → roles taken from ClientRoleTypes (checked against req.client.role)
 *
 * Empty arrays mean "no role is currently permitted" (the feature is reserved
 * for future configuration).
 */
const ApiRolePermissions = Object.freeze({

  admin: {
    createProject: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
    ],

    updateProject: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
      AdminRoleTypes.MANAGER,
    ],

    abortProject: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
    ],

    completeProject: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
    ],

    resumeProject: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
    ],

    deleteProject: [
      AdminRoleTypes.CEO,
    ],

    archiveProject: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
    ],

    getProject: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
      AdminRoleTypes.MANAGER,
      AdminRoleTypes.ANALYST,
      AdminRoleTypes.DEVELOPER,
      AdminRoleTypes.OTHER,
    ],

    getProjects: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
      AdminRoleTypes.MANAGER,
      AdminRoleTypes.ANALYST,
      AdminRoleTypes.DEVELOPER,
      AdminRoleTypes.OTHER,
    ],
  },

  client: {
    createProject: [],
    updateProject: [],
    abortProject: [],
    completeProject: [],
    resumeProject: [],
    deleteProject: [],
    getProject: [],
    getProjects: [],
  }

});

module.exports = { ApiRolePermissions };
