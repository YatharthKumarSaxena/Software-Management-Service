// configs/api-role-permissions.config.js

const { AdminRoleTypes } = require("./enums.config");

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

    onHoldProject: [
      AdminRoleTypes.CEO,
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

    activateProject: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
    ],

    changeProjectOwner: [
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

    approveProductRequest: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
      AdminRoleTypes.BUSINESS_ANALYST
    ],

    rejectProductRequest: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
      AdminRoleTypes.BUSINESS_ANALYST
    ],

    deleteProductRequest: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
    ],
  },

  // ── Stakeholder operations (admin-only) ───────────────────────────────────
  stakeholder: {
    createStakeholder: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
      AdminRoleTypes.MANAGER,
    ],
    updateStakeholder: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
      AdminRoleTypes.MANAGER,
    ],
    deleteStakeholder: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.MANAGER,
    ],
    getStakeholder: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
      AdminRoleTypes.MANAGER,
      AdminRoleTypes.ANALYST,
      AdminRoleTypes.DEVELOPER,
      AdminRoleTypes.OTHER,
    ],
    getStakeholders: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
      AdminRoleTypes.MANAGER,
      AdminRoleTypes.ANALYST,
      AdminRoleTypes.DEVELOPER,
      AdminRoleTypes.OTHER,
    ],
  },

  activityTracker: {
    listActivity: [
      AdminRoleTypes.CEO,
      AdminRoleTypes.BUSINESS_ANALYST,
      AdminRoleTypes.MANAGER,
      AdminRoleTypes.ANALYST
    ]
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
