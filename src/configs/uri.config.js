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
const PRODUCT_REQUEST_BASE = `${API_PREFIX}/product-requests`; // /software-management-service/api/v1/product-requests
const SCOPE_BASE = `${API_PREFIX}/scope`; // /software-management-service/api/v1/scope
const HLF_BASE = `${API_PREFIX}/high-level-features`; // /software-management-service/api/v1/high-level-features
const PRODUCT_VISION_BASE = `${API_PREFIX}/product-vision`; // /software-management-service/api/v1/product-vision
const COMMENT_BASE = `${API_PREFIX}/comments`; // /software-management-service/api/v1/comments
const ACTIVITY_TRACKER_BASE = `${API_PREFIX}/activity-trackers`; // /software-management-service/api/v1/activity-trackers
const ELICITATION_BASE = `${API_PREFIX}/elicitations`; // /software-management-service/api/v1/elicitations
const INCEPTION_BASE = `${API_PREFIX}/inceptions`; // /software-management-service/api/v1/inceptions
const MEETINGS_BASE = `${API_PREFIX}/meetings`; // /software-management-service/api/v1/meetings
const PARTICIPANTS_BASE = `${API_PREFIX}/participants`; // /software-management-service/api/v1/participants

module.exports = {
    INTERNAL_BASE,
    TEST_BASE,
    PROJECT_BASE,
    STAKEHOLDER_BASE,
    CLIENT_BASE,
    PRODUCT_REQUEST_BASE,
    SCOPE_BASE,
    HLF_BASE,
    PRODUCT_VISION_BASE,
    COMMENT_BASE,
    ACTIVITY_TRACKER_BASE,
    ELICITATION_BASE,
    INCEPTION_BASE,
    MEETINGS_BASE,
    PARTICIPANTS_BASE,
    INTERNAL_ROUTES: {
        CREATE_SUPER_ADMIN: `/create-super-admin`, // /software-management-service/api/v1/internal/create-super-admin
        CREATE_USER: `/create-user`, // /software-management-service/api/v1/internal/admin-panel/create-user
        PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE: `/auth/health`, // /software-management-service/api/v1/internal/auth/health
        PROVIDE_HEALTH_CHECK_TO_ADMIN_PANEL_SERVICE: `/admin-panel/health`, // /software-management-service/api/v1/internal/admin-panel/health
        UPDATE_USER_DETAILS: `/update-user/:userId`, // /software-management-service/api/v1/internal/update-user/:userId
        DELETE_USER: `/delete-user/:userId`, // /software-management-service/api/v1/internal/delete-user/:userId
        TOGGLE_ACTIVE_STATUS: `/toggle-active/:userId`, // /software-management-service/api/v1/internal/toggle-active/:userId
        TOGGLE_BLOCK_USER_STATUS: `/toggle-block-user/:userId`, // /software-management-service/api/v1/internal/toggle-block-user/:userId
        TOGGLE_BLOCK_DEVICE_STATUS: `/toggle-block-device/:deviceUUID`, // /software-management-service/api/v1/internal/toggle-block-device/:deviceUUID
        UPDATE_ORGANIZATION_IN_CLIENT: `/update-client-organizations/:clientId` // /software-management-service/api/v1/internal/update-client-organizations/:clientId
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
        LIST_PROJECTS:    `/list`,                        // GET     /api/v1/projects/list
        ACTIVATE_PROJECT: `/activate/:projectId`,         // PATCH   /api/v1/projects/activate/:projectId
        CHANGE_PROJECT_OWNER: `/change-owner/:projectId`  // PATCH   /api/v1/projects/change-owner/:projectId
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
    },
    PRODUCT_REQUEST_ROUTES: {
        CREATE_PRODUCT_REQUEST: `/create`,                     // POST    /api/v1/product-requests/create
        UPDATE_PRODUCT_REQUEST: `/update/:requestId`,          // PATCH   /api/v1/product-requests/update/:requestId
        DELETE_PRODUCT_REQUEST: `/delete/:requestId`,          // DELETE  /api/v1/product-requests/delete/:requestId
        GET_PRODUCT_REQUEST:    `/get/:requestId`,             // GET     /api/v1/product-requests/get/:requestId
        LIST_PRODUCT_REQUESTS:   `/list`,                            // GET     /api/v1/product-requests/list
        APPROVE_PRODUCT_REQUEST: `/approve/:requestId`,        // PATCH   /api/v1/product-requests/approve/:requestId
        REJECT_PRODUCT_REQUEST: `/reject/:requestId`,           // PATCH   /api/v1/product-requests/reject/:requestId
        CANCEL_PRODUCT_REQUEST: `/cancel/:requestId`            // PATCH   /api/v1/product-requests/cancel/:requestId
    },
    SCOPE_ROUTES: {
        GET_SCOPE:       `/get/:scopeId`,         // GET /software-management-service/api/v1/scope/get/:projectId
        UPDATE_SCOPE:    `/update/:scopeId`,      // PATCH /software-management-service/api/v1/scope/update/:projectId
        CREATE_SCOPE:    `/create/:projectId`,      // POST /software-management-service/api/v1/scope/create/:projectId
        DELETE_SCOPE:    `/delete/:scopeId`,       // DELETE /software-management-service/api/v1/scope/delete/:projectId
        LIST_SCOPES:     `/list/:projectId`        // GET /software-management-service/api/v1/scope/list/:projectId
    },
    HLF_ROUTES: {
        GET_HLF:       `/get/:hlfId`,         // GET /software-management-service/api/v1/high-level-features/get/:hlfId
        UPDATE_HLF:    `/update/:hlfId`,      // PATCH /software-management-service/api/v1/high-level-features/update/:hlfId
        CREATE_HLF:    `/create/:projectId`,      // POST /software-management-service/api/v1/high-level-features/create/:projectId
        DELETE_HLF:    `/delete/:hlfId`,       // DELETE /software-management-service/api/v1/high-level-features/delete/:hlfId
        LIST_HLF:     `/list/:projectId`        // GET /software-management-service/api/v1/high-level-features/list/:projectId
    },
    PRODUCT_VISION_ROUTES: {
        GET_PRODUCT_VISION:       `/get/:projectId`,         // GET /software-management-service/api/v1/product-vision/get/:projectId
        UPDATE_PRODUCT_VISION:    `/update/:projectId`,      // PATCH /software-management-service/api/v1/product-vision/update/:projectId
        CREATE_PRODUCT_VISION:    `/create/:projectId`,      // POST /software-management-service/api/v1/product-vision/create/:projectId
        DELETE_PRODUCT_VISION:    `/delete/:projectId`       // DELETE /software-management-service/api/v1/product-vision/delete/:projectId
    },
    COMMENT_ROUTES: {
        CREATE_COMMENT:              `/create`,                           // POST   /api/v1/comments/create
        GET_COMMENT:                 `/get/:commentId`,                   // GET    /api/v1/comments/get/:commentId
        LIST_COMMENTS:               `/list/:entityType/:entityId`,       // GET    /api/v1/comments/list/:entityType/:entityId
        LIST_HIERARCHICAL_COMMENTS:  `/list-hierarchical/:entityType/:entityId`, // GET /api/v1/comments/list-hierarchical/:entityType/:entityId
        UPDATE_COMMENT:              `/update/:commentId`,                // PATCH  /api/v1/comments/update/:commentId
        DELETE_COMMENT:              `/delete/:commentId`                 // DELETE /api/v1/comments/delete/:commentId
    },
    ACTIVITY_TRACKER_ROUTES: {
        GET_MY_ACTIVITY:  `/my-activity`,      // GET /api/v1/activity-trackers/my-activity
        LIST_ACTIVITY:    `/list`,              // GET /api/v1/activity-trackers/list (admin only)
        GET_ACTIVITY:     `/get/:activityId`    // GET /api/v1/activity-trackers/get/:activityId (admin only)
    },
    ELICITATION_ROUTES: {
        CREATE_ELICITATION: `/create/:projectId`,  // POST /api/v1/elicitations/create/:projectId
        UPDATE_ELICITATION: `/update/:projectId`, // PATCH /api/v1/elicitations/update/:projectId/:elicitationId
        DELETE_ELICITATION: `/delete/:projectId`, // DELETE /api/v1/elicitations/delete/:projectId/:elicitationId
        GET_ELICITATION:    `/get/:elicitationId`,    // GET /api/v1/elicitations/get/:projectId/:elicitationId
        GET_LATEST_ELICITATION: `/latest/:projectId`,            // GET /api/v1/elicitations/latest/:projectId
        LIST_ELICITATIONS:  `/list/:projectId`,       // GET /api/v1/elicitations/list/:projectId
        FREEZE_ELICITATION: `/freeze/:projectId`  // PATCH /api/v1/elicitations/freeze/:elicitationId
    },
    FAST_ROUTES: {
        CREATE_FAST: `/create/:projectId`, // POST /api/v1/fast/create/:projectId
        UPDATE_FAST: `/update/:projectId/:fastId`, // PATCH /api/v1/fast/update/:projectId/:fastId
        DELETE_FAST: `/delete/:projectId/:fastId`, // DELETE /api/v1/fast/delete/:projectId/:fastId
        GET_FAST: `/get/:projectId/:fastId`, // GET /api/v1/fast/get/:projectId/:fastId
        LIST_FASTS: `/list/:projectId`, // GET /api/v1/fast/list/:projectId
        ADD_FAST_MEMBER: `/add-member/:projectId/:fastId`, // PATCH /api/v1/fast/add-member/:projectId/:fastId
        REMOVE_FAST_MEMBER: `/remove-member/:projectId/:fastId` // PATCH /api/v1/fast/remove-member/:projectId/:fastId
    },
    INCEPTION_ROUTES: {
        GET_LATEST_INCEPTION: `/get-latest/:projectId`,      // GET /software-management-service/api/v1/inceptions/get/:projectId
        GET_INCEPTION:    `/get/:inceptionId`,      // GET /api/v1/inceptions/get/:inceptionId
        LIST_INCEPTIONS:  `/list/:projectId`,     // GET /api/v1/inceptions/list/:projectId
        DELETE_INCEPTION: `/delete/:projectId`,  // DELETE /api/v1/inceptions/delete/:inceptionId
        CREATE_INCEPTION: `/create/:projectId`,  // POST /api/v1/inceptions/create/:projectId
        FREEZE_INCEPTION: `/freeze/:projectId`  // PATCH /api/v1/inceptions/freeze/:inceptionId
    },
    MEETING_ROUTES: {
        CREATE_MEETING: `/create/:entityType/:projectId`,  // POST /api/v1/meetings/create/:entityType/:entityId
        UPDATE_MEETING: `/update/:entityType/:meetingId`,              // PATCH /api/v1/meetings/update/:meetingId
        CANCEL_MEETING: `/cancel/:entityType/:meetingId`,               // PATCH /api/v1/meetings/cancel/:meetingId
        GET_MEETING:    `/get/:entityType/:meetingId`,                  // GET /api/v1/meetings/get/:meetingId
        LIST_MEETINGS:  `/list/:entityType/:projectId`                  // GET /api/v1/meetings/list/:projectId
    },
    PARTICIPANT_ROUTES: {
        ADD_PARTICIPANT: `/add/:entityType/:meetingId`, // PATCH /api/v1/participants/add/:meetingId
        REMOVE_PARTICIPANT: `/remove/:entityType/:meetingId`, // PATCH /api/v1/participants/remove/:meetingId
        UPDATE_PARTICIPANT: `/update/:entityType/:meetingId`, // PATCH /api/v1/participants/update/:participantId
        GET_PARTICIPANT: `/get/:entityType/:meetingId/:participantId`, // GET /api/v1/participants/get/:participantId
        LIST_PARTICIPANTS: `/list/:entityType/:meetingId` // GET /api/v1/participants/list/:meetingId
    }
};