const DB_COLLECTIONS = {
    ACTIVITY_TRACKERS: "activity_trackers",
    COUNTERS: "counters",
    DEVICES: "devices",
    ADMINS: "admins",
    CLIENTS: "clients",
    REQUESTS: "requests",
    SERVICE_TRACKER: "service_trackers",
    
    // 🔄 New: Unified requests collection (all request types via discriminators)
    ADMIN_REQUESTS: "admin_requests",
    
    // ⚠️ Legacy: Kept for backward compatibility during migration
    ADMIN_STATUS_REQUESTS: "admin_status_requests",
    ROLE_CHANGE_REQUESTS: "role_change_requests",
    PERMISSION_REQUESTS: "permission_requests",
    CLIENT_ONBOARDING_REQUESTS: "client_onboarding_requests",
    
    SPECIAL_PERMISSIONS: "special_permissions",
    BLOCKED_PERMISSIONS: "blocked_permissions",
    SERVICE_TRACKERS: "service_trackers",
    SERVICE_TOKENS: "service_tokens"
}

module.exports = { DB_COLLECTIONS };