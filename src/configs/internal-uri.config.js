/**
 * Internal Service URI Configuration
 * 
 * Central configuration for all internal microservice API endpoints.
 * Contains URIs and HTTP methods for Auth Service and Software Management Service.
 * 
 * @author Software Management Service Team
 * @date 2026-03-06
 */

const requestMethod = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    PATCH: "PATCH"
}

/**
 * Custom Auth Service Internal API Endpoints
 */
const CUSTOM_AUTH_URIS = {
    HEALTH_CHECK: {
        method: "GET",
        uri: "/custom-auth-service/api/v1/internal/software-management/health"
    }
};

/**
 * Software Management Service Internal API Endpoints
 */
const ADMIN_PANEL_URIS = {
    HEALTH_CHECK: {
        method: "GET",
        uri: "/admin-panel-service/api/v1/internal/software-management/health"
    },
    CREATE_USER: {
        method: "POST",
        uri: "/admin-panel-service/api/v1/internal/create-user"
    }
};

module.exports = {
    CUSTOM_AUTH_URIS,
    ADMIN_PANEL_URIS,
    requestMethod
};
