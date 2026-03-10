// Base path of all APIs (can be changed in one place if needed)
const BASE_PATH = "/software-management-service";

// API versioning (helps us move from /v1 to /v2 easily)
const API_VERSION = "/api/v1";

// API Prefix that is Base Path + API Version
const API_PREFIX = `${BASE_PATH}${API_VERSION}`;

const INTERNAL_BASE = `${API_PREFIX}/internal`;  // /software-management-service/api/v1/internal
const TEST_BASE = `${API_PREFIX}/test`; // /software-management-service/api/v1/test
const ADMIN_BASE = `${API_PREFIX}/admin`; // /software-management-service/api/v1/admin

module.exports = {
    INTERNAL_BASE,
    TEST_BASE,
    ADMIN_BASE,
    INTERNAL_ROUTES: {
        CREATE_SUPER_ADMIN: `/create-super-admin`, // /software-management-service/api/v1/internal/create-super-admin
        CREATE_USER: `/create-user`, // /software-management-service/api/v1/internal/admin-panel/create-user
        PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE: `/auth/health`, // /software-management-service/api/v1/internal/auth/health
        PROVIDE_HEALTH_CHECK_TO_ADMIN_PANEL_SERVICE: `/admin-panel/health` // /software-management-service/api/v1/internal/admin-panel/health
    },
    TEST_ROUTES: {
        WELCOME_ADMIN: `/welcome-admin`, // /software-management-service/api/v1/test/welcome-admin
        WELCOME_CLIENT: `/welcome-client` // /software-management-service/api/v1/test/welcome-client
    },
    ADMIN_ROUTES: {
        // Projects
        CREATE_PROJECT:   `/create-project`,                     // POST    /api/v1/admin/create-project
        UPDATE_PROJECT:   `/update-project/:projectId`,          // PATCH   /api/v1/admin/update-project/:projectId
        ABORT_PROJECT:    `/abort-project/:projectId`,           // PATCH   /api/v1/admin/abort-project/:projectId
        COMPLETE_PROJECT: `/complete-project/:projectId`,        // PATCH   /api/v1/admin/complete-project/:projectId
        RESUME_PROJECT:   `/resume-project/:projectId`,          // PATCH   /api/v1/admin/resume-project/:projectId
        DELETE_PROJECT:   `/delete-project/:projectId`,          // DELETE  /api/v1/admin/delete-project/:projectId
        ARCHIVE_PROJECT: `/archive-project/:projectId`,           // PATCH   /api/v1/admin/archive-project/:projectId
        GET_PROJECT:     `/get-project/:projectId`,               // GET     /api/v1/admin/get-project/:projectId
        GET_PROJECTS:    `/get-projects`,                         // GET     /api/v1/admin/get-projects
    }
};