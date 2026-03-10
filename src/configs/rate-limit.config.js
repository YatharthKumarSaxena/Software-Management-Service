// configs/rate-limit.config.js

module.exports = {
  perDevice: {
    malformedRequest: {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      prefix: "malformed_request",
      reason: "Malformed request",
      message: "Too many malformed requests. Fix your payload and try again later."
    },

    unknownRoute: {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      prefix: "unknown_route",
      reason: "Unknown route access",
      message: "Too many invalid or unauthorized requests."
    }

  },

  perUserAndDevice: {
    welcomeAdmin: {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
      prefix: "welcome_admin",
      reason: "Welcome admin endpoint abuse",
      message: "Too many requests to welcome admin endpoint. Please try again later."
    },
    welcomeClient: {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
      prefix: "welcome_client",
      reason: "Welcome client endpoint abuse",
      message: "Too many requests to welcome client endpoint. Please try again later."
    },
    createProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_project",
      reason: "Create project endpoint abuse",
      message: "Too many requests to create project endpoint. Please try again later."
    },
    updateProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_project",
      reason: "Update project endpoint abuse",
      message: "Too many requests to update project endpoint. Please try again later."
    },
    abortProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "abort_project",
      reason: "Abort project endpoint abuse",
      message: "Too many requests to abort project endpoint. Please try again later."
    },
    completeProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "complete_project",
      reason: "Complete project endpoint abuse",
      message: "Too many requests to complete project endpoint. Please try again later."
    },
    resumeProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "resume_project",
      reason: "Resume project endpoint abuse",
      message: "Too many requests to resume project endpoint. Please try again later."
    },
    deleteProject: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_project",
      reason: "Delete project endpoint abuse",
      message: "Too many requests to delete project endpoint. Please try again later."
    },
    archiveProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "archive_project",
      reason: "Archive project endpoint abuse",
      message: "Too many requests to archive project endpoint. Please try again later."
    },
    getProject: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_project",
      reason: "Get project endpoint abuse",
      message: "Too many requests to get project endpoint. Please try again later."
    },
    getProjects: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_projects",
      reason: "Get projects endpoint abuse",
      message: "Too many requests to get projects endpoint. Please try again later."
    }
  }
};