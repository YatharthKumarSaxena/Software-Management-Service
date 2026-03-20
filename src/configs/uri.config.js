// Base path of all APIs (can be changed in one place if needed)
const BASE_PATH = "/software-management-service";

// API versioning (helps us move from /v1 to /v2 easily)
const API_VERSION = "/api/v1";

// API Prefix that is Base Path + API Version
const API_PREFIX = `${BASE_PATH}${API_VERSION}`;

const INTERNAL_BASE = `${API_PREFIX}/internal`;  // /software-management-service/api/v1/internal
const TEST_BASE = `${API_PREFIX}/test`; // /software-management-service/api/v1/test
const PROJECT_BASE = `${API_PREFIX}/projects`; // /software-management-service/api/v1/projects
const STAKEHOLDER_BASE = `${API_PREFIX}/stakeholders`; // /software-management-service/api/v1/stakeholders
const CLIENT_BASE = `${API_PREFIX}/clients`; // /software-management-service/api/v1/clients

module.exports = {
    INTERNAL_BASE,
    TEST_BASE,
    PROJECT_BASE,
    STAKEHOLDER_BASE,
    CLIENT_BASE,
    INTERNAL_ROUTES: {
        CREATE_SUPER_ADMIN: `/create-super-admin`, // /software-management-service/api/v1/internal/create-super-admin
        CREATE_USER: `/create-user`, // /software-management-service/api/v1/internal/admin-panel/create-user
        PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE: `/auth/health`, // /software-management-service/api/v1/internal/auth/health
        PROVIDE_HEALTH_CHECK_TO_ADMIN_PANEL_SERVICE: `/admin-panel/health`, // /software-management-service/api/v1/internal/admin-panel/health
        UPDATE_USER_DETAILS: `/update-user/:userId`, // /software-management-service/api/v1/internal/update-user/:userId
        DELETE_USER: `/delete-user/:userId`, // /software-management-service/api/v1/internal/delete-user/:userId
        TOGGLE_ACTIVE_STATUS: `/toggle-active/:userId`, // /software-management-service/api/v1/internal/toggle-active/:userId
        TOGGLE_BLOCK_USER_STATUS: `/toggle-block-user/:userId`, // /software-management-service/api/v1/internal/toggle-block-user/:userId
        TOGGLE_BLOCK_DEVICE_STATUS: `/toggle-block-device/:deviceUUID`, // /software-management-service/api/v1/internal/toggle-block-device/:userId
    },
    TEST_ROUTES: {
        WELCOME_ADMIN: `/welcome-admin`, // /software-management-service/api/v1/test/welcome-admin
        WELCOME_CLIENT: `/welcome-client` // /software-management-service/api/v1/test/welcome-client
    },
    PROJECT_ROUTES: {
        // Projects
        CREATE_PROJECT:   `/create`,                     // POST    /api/v1/projects/create
        UPDATE_PROJECT:   `/update/:projectId`,          // PATCH   /api/v1/projects/update/:projectId
        ON_HOLD_PROJECT:  `/on-hold/:projectId`,           // PATCH   /api/v1/projects/on-hold/:projectId
        ABORT_PROJECT:    `/abort/:projectId`,           // PATCH   /api/v1/projects/abort/:projectId
        COMPLETE_PROJECT: `/complete/:projectId`,        // PATCH   /api/v1/projects/complete/:projectId
        RESUME_PROJECT:   `/resume/:projectId`,          // PATCH   /api/v1/projects/resume/:projectId
        DELETE_PROJECT:   `/delete/:projectId`,          // DELETE  /api/v1/projects/delete/:projectId
        ARCHIVE_PROJECT: `/archive/:projectId`,           // PATCH   /api/v1/projects/archive/:projectId
        GET_PROJECT:     `/get/:projectId`,               // GET     /api/v1/projects/get/:projectId
        LIST_PROJECTS:    `/list`                        // GET     /api/v1/projects/list
    },
    STAKEHOLDER_ROUTES: {
        CREATE_STAKEHOLDER: `/create`,                     // POST    /api/v1/stakeholders/create
        UPDATE_STAKEHOLDER: `/update/:stakeholderId`,       // PATCH   /api/v1/stakeholders/update/:stakeholderId
        DELETE_STAKEHOLDER: `/delete/:stakeholderId`,       // DELETE  /api/v1/stakeholders/delete/:stakeholderId
        GET_STAKEHOLDER:    `/get/:stakeholderId`,          // GET     /api/v1/stakeholders/get/:stakeholderId
        LIST_STAKEHOLDERS:   `/list`                            // GET     /api/v1/stakeholders/list
    },
    CLIENT_ROUTES: {
        GET_PROJECT:       `/view-project/:projectId`,         // GET /software-management-service/api/v1/clients/view-project/:projectId
        LIST_PROJECTS:     `/list-projects`,                   // GET /software-management-service/api/v1/clients/list-projects
        GET_STAKEHOLDER:   `/get-stakeholder/:userId`,  // GET /software-management-service/api/v1/clients/get-stakeholder/:userId
        LIST_STAKEHOLDERS: `/list-stakeholders`                // GET /software-management-service/api/v1/clients/list-stakeholders
    }
};