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
      maxRequests: 1000,
      windowMs: 60 * 1000,
      prefix: "update_project",
      reason: "Update project endpoint abuse",
      message: "Too many requests to update project endpoint. Please try again later."
    },
    onHoldProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "on_hold_project",
      reason: "On-hold project endpoint abuse",
      message: "Too many requests to on-hold project endpoint. Please try again later."
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
    },
    createStakeholder: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_stakeholder",
      reason: "Create stakeholder endpoint abuse",
      message: "Too many requests to create stakeholder endpoint. Please try again later."
    },
    updateStakeholder: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_stakeholder",
      reason: "Update stakeholder endpoint abuse",
      message: "Too many requests to update stakeholder endpoint. Please try again later."
    },
    deleteStakeholder: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_stakeholder",
      reason: "Delete stakeholder endpoint abuse",
      message: "Too many requests to delete stakeholder endpoint. Please try again later."
    },
    getStakeholder: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_stakeholder",
      reason: "Get stakeholder endpoint abuse",
      message: "Too many requests to get stakeholder endpoint. Please try again later."
    },
    getStakeholders: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_stakeholders",
      reason: "Get stakeholders endpoint abuse",
      message: "Too many requests to get stakeholders endpoint. Please try again later."
    },

    // ── Client-facing read endpoints ─────────────────────────────────────────
    clientGetProject: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "client_get_project",
      reason: "Client get project endpoint abuse",
      message: "Too many requests to view project. Please try again later."
    },
    clientListProjects: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "client_list_projects",
      reason: "Client list projects endpoint abuse",
      message: "Too many requests to list projects. Please try again later."
    },
    clientGetStakeholder: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "client_get_stakeholder",
      reason: "Client get stakeholder endpoint abuse",
      message: "Too many requests to get stakeholder. Please try again later."
    },
    clientListStakeholders: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "client_list_stakeholders",
      reason: "Client list stakeholders endpoint abuse",
      message: "Too many requests to list stakeholders. Please try again later."
    },
    createProductRequest: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_product_request",
      reason: "Create product request endpoint abuse",
      message: "Too many requests to create product request endpoint. Please try again later."
    },
    updateProductRequest: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_product_request",
      reason: "Update product request endpoint abuse",
      message: "Too many requests to update product request endpoint. Please try again later."
    },
    deleteProductRequest: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_product_request",
      reason: "Delete product request endpoint abuse",
      message: "Too many requests to delete product request endpoint. Please try again later."
    },
    getProductRequest: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_product_request",
      reason: "Get product request endpoint abuse",
      message: "Too many requests to get product request endpoint. Please try again later."
    },
    listProductRequests: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_product_requests",
      reason: "List product requests endpoint abuse",
      message: "Too many requests to list product requests endpoint. Please try again later."
    },
    cancelProductRequest: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "cancel_product_request",
      reason: "Cancel product request endpoint abuse",
      message: "Too many requests to cancel product request endpoint. Please try again later."
    },
    approveProductRequest: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "approve_product_request",
      reason: "Approve product request endpoint abuse",
      message: "Too many requests to approve product request endpoint. Please try again later."
    },
    rejectProductRequest: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "reject_product_request",
      reason: "Reject product request endpoint abuse",
      message: "Too many requests to reject product request endpoint. Please try again later."
    }
  }
};