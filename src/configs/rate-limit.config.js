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
    activateProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "activate_project",
      reason: "Activate project endpoint abuse",
      message: "Too many requests to activate project endpoint. Please try again later."
    },
    archiveProject: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "archive_project",
      reason: "Archive project endpoint abuse",
      message: "Too many requests to archive project endpoint. Please try again later."
    },
    changeProjectOwner: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "change_project_owner",
      reason: "Change project owner endpoint abuse",
      message: "Too many requests to change project owner endpoint. Please try again later."
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
    },
    createComment: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "create_comment",
      reason: "Create comment endpoint abuse",
      message: "Too many requests to create comment endpoint. Please try again later."
    },
    updateComment: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "update_comment",
      reason: "Update comment endpoint abuse",
      message: "Too many requests to update comment endpoint. Please try again later."
    },
    deleteComment: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "delete_comment",
      reason: "Delete comment endpoint abuse",
      message: "Too many requests to delete comment endpoint. Please try again later."
    },
    getComment: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_comments",
      reason: "Get comments endpoint abuse",
      message: "Too many requests to get comments endpoint. Please try again later."
    },
    listComments: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_comments",
      reason: "List comments endpoint abuse",
      message: "Too many requests to list comments endpoint. Please try again later."
    },
    listHierarchicalComments: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_hierarchical_comments",
      reason: "List hierarchical comments endpoint abuse",
      message: "Too many requests to list hierarchical comments endpoint. Please try again later."
    },
    getMyActivity: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_my_activity",
      reason: "Get my activity endpoint abuse",
      message: "Too many requests to get my activity endpoint. Please try again later."
    },
    getActivityById: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_activity_by_id",
      reason: "Get activity by ID endpoint abuse",
      message: "Too many requests to get activity by ID endpoint. Please try again later."
    },
    listActivity: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_activity",
      reason: "List activity endpoint abuse",
      message: "Too many requests to list activity endpoint. Please try again later."
    },
    createScope: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_scope",
      reason: "Create scope endpoint abuse",
      message: "Too many requests to create scope endpoint. Please try again later."
    },
    updateScope: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_scope",
      reason: "Update scope endpoint abuse",
      message: "Too many requests to update scope endpoint. Please try again later."
    },
    deleteScope: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_scope",
      reason: "Delete scope endpoint abuse",
      message: "Too many requests to delete scope endpoint. Please try again later."
    },
    getScope: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_scope",
      reason: "Get scope endpoint abuse",
      message: "Too many requests to get scope endpoint. Please try again later."
    },
    listScopes: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_scopes",
      reason: "List scopes endpoint abuse",
      message: "Too many requests to list scopes endpoint. Please try again later."
    },
    createHLF: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_hlf",
      reason: "Create HLF endpoint abuse",
      message: "Too many requests to create HLF endpoint. Please try again later."
    },
    updateHLF: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_hlf",
      reason: "Update HLF endpoint abuse",
      message: "Too many requests to update HLF endpoint. Please try again later."
    },
    deleteHLF: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_hlf",
      reason: "Delete HLF endpoint abuse",
      message: "Too many requests to delete HLF endpoint. Please try again later."
    },
    getHLF: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_hlf",
      reason: "Get HLF endpoint abuse",
      message: "Too many requests to get HLF endpoint. Please try again later."
    },
    listHLFs: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_hlfs",
      reason: "List HLFs endpoint abuse",
      message: "Too many requests to list HLFs endpoint. Please try again later."
    },
    createProductVision: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_product_vision",
      reason: "Create product vision endpoint abuse",
      message: "Too many requests to create product vision endpoint. Please try again later."
    },
    updateProductVision: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_product_vision",
      reason: "Update product vision endpoint abuse",
      message: "Too many requests to update product vision endpoint. Please try again later."
    },
    deleteProductVision: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_product_vision",
      reason: "Delete product vision endpoint abuse",
      message: "Too many requests to delete product vision endpoint. Please try again later."
    },
    getProductVision: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_product_vision",
      reason: "Get product vision endpoint abuse",
      message: "Too many requests to get product vision endpoint. Please try again later."
    },
    createElicitation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_elicitation",
      reason: "Create elicitation endpoint abuse",
      message: "Too many requests to create elicitation endpoint. Please try again later."
    },
    updateElicitation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_elicitation",
      reason: "Update elicitation endpoint abuse",
      message: "Too many requests to update elicitation endpoint. Please try again later."
    },
    deleteElicitation: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_elicitation",
      reason: "Delete elicitation endpoint abuse",
      message: "Too many requests to delete elicitation endpoint. Please try again later."
    },
    freezeElicitation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "freeze_elicitation",
      reason: "Freeze elicitation endpoint abuse",
      message: "Too many requests to freeze elicitation endpoint. Please try again later."
    },
    getElicitation: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_elicitation",
      reason: "Get elicitation endpoint abuse",
      message: "Too many requests to get elicitation endpoint. Please try again later."
    },
    listElicitations: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_elicitations",
      reason: "List elicitations endpoint abuse",
      message: "Too many requests to list elicitations endpoint. Please try again later."
    },
    createInception: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_inception",
      reason: "Create inception endpoint abuse",
      message: "Too many requests to create inception endpoint. Please try again later."
    },
    updateInception: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_inception",
      reason: "Update inception endpoint abuse",
      message: "Too many requests to update inception endpoint. Please try again later."
    },
    getInception: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_inception",
      reason: "Get inception endpoint abuse",
      message: "Too many requests to get inception endpoint. Please try again later."
    },
    listInceptions: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_inceptions",
      reason: "List inceptions endpoint abuse",
      message: "Too many requests to list inceptions endpoint. Please try again later."
    },
    deleteInception: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_inception",
      reason: "Delete inception endpoint abuse",
      message: "Too many requests to delete inception endpoint. Please try again later."
    },
    freezeInception: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "freeze_inception",
      reason: "Freeze inception endpoint abuse",
      message: "Too many requests to freeze inception endpoint. Please try again later."
    },
    getLatestInception: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_latest_inception",
      reason: "Get latest inception endpoint abuse",
      message: "Too many requests to get latest inception endpoint. Please try again later."
    },
    createElicitation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_elicitation",
      reason: "Create elicitation endpoint abuse",
      message: "Too many requests to create elicitation endpoint. Please try again later."
    },
    updateElicitation: {
      maxRequests: 50,
      windowMs: 60 * 1000,
      prefix: "update_elicitation",
      reason: "Update elicitation endpoint abuse",
      message: "Too many requests to update elicitation endpoint. Please try again later."
    },
    deleteElicitation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "delete_elicitation",
      reason: "Delete elicitation endpoint abuse",
      message: "Too many requests to delete elicitation endpoint. Please try again later."
    },
    getElicitation: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_elicitation",
      reason: "Get elicitation endpoint abuse",
      message: "Too many requests to get elicitation endpoint. Please try again later."
    },
    getLatestElicitation: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_latest_elicitation",
      reason: "Get latest elicitation endpoint abuse",
      message: "Too many requests to get latest elicitation endpoint. Please try again later."
    },
    listElicitations: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_elicitations",
      reason: "List elicitations endpoint abuse",
      message: "Too many requests to list elicitations endpoint. Please try again later."
    },
    addParticipant: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "add_participant",
      reason: "Add participant endpoint abuse",
      message: "Too many requests to add participant endpoint. Please try again later."
    },
    removeParticipant: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "remove_participant",
      reason: "Remove participant endpoint abuse",
      message: "Too many requests to remove participant endpoint. Please try again later."
    },
    updateParticipant: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "update_participant",
      reason: "Update participant endpoint abuse",
      message: "Too many requests to update participant endpoint. Please try again later."
    },
    getParticipant: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_participant",
      reason: "Get participant endpoint abuse",
      message: "Too many requests to get participant endpoint. Please try again later."
    },
    listParticipants: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_participants",
      reason: "List participants endpoint abuse",
      message: "Too many requests to list participants endpoint. Please try again later."
    },
    createNegotiation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_negotiation",
      reason: "Create negotiation endpoint abuse",
      message: "Too many requests to create negotiation endpoint. Please try again later."
    },
    updateNegotiation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_negotiation",
      reason: "Update negotiation endpoint abuse",
      message: "Too many requests to update negotiation endpoint. Please try again later."
    },
    deleteNegotiation: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_negotiation",
      reason: "Delete negotiation endpoint abuse",
      message: "Too many requests to delete negotiation endpoint. Please try again later."
    },
    freezeNegotiation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "freeze_negotiation",
      reason: "Freeze negotiation endpoint abuse",
      message: "Too many requests to freeze negotiation endpoint. Please try again later."
    },
    getNegotiation: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_negotiation",
      reason: "Get negotiation endpoint abuse",
      message: "Too many requests to get negotiation endpoint. Please try again later."
    },
    getLatestNegotiation: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_latest_negotiation",
      reason: "Get latest negotiation endpoint abuse",
      message: "Too many requests to get latest negotiation endpoint. Please try again later."
    },
    listNegotiations: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_negotiations",
      reason: "List negotiations endpoint abuse",
      message: "Too many requests to list negotiations endpoint. Please try again later."
    },
    createSpecification: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_specification",
      reason: "Create specification endpoint abuse",
      message: "Too many requests to create specification endpoint. Please try again later."
    },
    updateSpecification: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_specification",
      reason: "Update specification endpoint abuse",
      message: "Too many requests to update specification endpoint. Please try again later."
    },
    deleteSpecification: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_specification",
      reason: "Delete specification endpoint abuse",
      message: "Too many requests to delete specification endpoint. Please try again later."
    },
    freezeSpecification: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "freeze_specification",
      reason: "Freeze specification endpoint abuse",
      message: "Too many requests to freeze specification endpoint. Please try again later."
    },
    getSpecification: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_specification",
      reason: "Get specification endpoint abuse",
      message: "Too many requests to get specification endpoint. Please try again later."
    },
    getLatestSpecification: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_latest_specification",
      reason: "Get latest specification endpoint abuse",
      message: "Too many requests to get latest specification endpoint. Please try again later."
    },
    listSpecifications: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_specifications",
      reason: "List specifications endpoint abuse",
      message: "Too many requests to list specifications endpoint. Please try again later."
    },
    createElaboration: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_elaboration",
      reason: "Create elaboration endpoint abuse",
      message: "Too many requests to create elaboration endpoint. Please try again later."
    },
    updateElaboration: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_elaboration",
      reason: "Update elaboration endpoint abuse",
      message: "Too many requests to update elaboration endpoint. Please try again later."
    },
    deleteElaboration: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_elaboration",
      reason: "Delete elaboration endpoint abuse",
      message: "Too many requests to delete elaboration endpoint. Please try again later."
    },
    freezeElaboration: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "freeze_elaboration",
      reason: "Freeze elaboration endpoint abuse",
      message: "Too many requests to freeze elaboration endpoint. Please try again later."
    },
    getElaboration: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_elaboration",
      reason: "Get elaboration endpoint abuse",
      message: "Too many requests to get elaboration endpoint. Please try again later."
    },
    getLatestElaboration: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_latest_elaboration",
      reason: "Get latest elaboration endpoint abuse",
      message: "Too many requests to get latest elaboration endpoint. Please try again later."
    },
    listElaborations: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_elaborations",
      reason: "List elaborations endpoint abuse",
      message: "Too many requests to list elaborations endpoint. Please try again later."
    },
    createValidation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "create_validation",
      reason: "Create validation endpoint abuse",
      message: "Too many requests to create validation endpoint. Please try again later."
    },
    updateValidation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "update_validation",
      reason: "Update validation endpoint abuse",
      message: "Too many requests to update validation endpoint. Please try again later."
    },
    deleteValidation: {
      maxRequests: 5,
      windowMs: 60 * 1000,
      prefix: "delete_validation",
      reason: "Delete validation endpoint abuse",
      message: "Too many requests to delete validation endpoint. Please try again later."
    },
    freezeValidation: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "freeze_validation",
      reason: "Freeze validation endpoint abuse",
      message: "Too many requests to freeze validation endpoint. Please try again later."
    },
    getValidation: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_validation",
      reason: "Get validation endpoint abuse",
      message: "Too many requests to get validation endpoint. Please try again later."
    },
    getLatestValidation: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_latest_validation",
      reason: "Get latest validation endpoint abuse",
      message: "Too many requests to get latest validation endpoint. Please try again later."
    },
    listValidations: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_validations",
      reason: "List validations endpoint abuse",
      message: "Too many requests to list validations endpoint. Please try again later."
    },

    // ── Meeting CRUD operations ──────────────────────────────────────────────
    createMeeting: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "create_meeting",
      reason: "Create meeting endpoint abuse",
      message: "Too many requests to create meeting endpoint. Please try again later."
    },
    updateMeeting: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "update_meeting",
      reason: "Update meeting endpoint abuse",
      message: "Too many requests to update meeting endpoint. Please try again later."
    },
    cancelMeeting: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "cancel_meeting",
      reason: "Cancel meeting endpoint abuse",
      message: "Too many requests to cancel meeting endpoint. Please try again later."
    },
    getMeeting: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "get_meeting",
      reason: "Get meeting endpoint abuse",
      message: "Too many requests to get meeting endpoint. Please try again later."
    },
    listMeetings: {
      maxRequests: 30,
      windowMs: 60 * 1000,
      prefix: "list_meetings",
      reason: "List meetings endpoint abuse",
      message: "Too many requests to list meetings endpoint. Please try again later."
    },

    // ── Meeting Scheduling operations ────────────────────────────────────────
    scheduleMeeting: {
      maxRequests: 15,
      windowMs: 60 * 1000,
      prefix: "schedule_meeting",
      reason: "Schedule meeting endpoint abuse",
      message: "Too many requests to schedule meeting endpoint. Please try again later."
    },
    rescheduleMeeting: {
      maxRequests: 20,
      windowMs: 60 * 1000,
      prefix: "reschedule_meeting",
      reason: "Reschedule meeting endpoint abuse",
      message: "Too many requests to reschedule meeting endpoint. Please try again later."
    },
    startMeeting: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "start_meeting",
      reason: "Start meeting endpoint abuse",
      message: "Too many requests to start meeting endpoint. Please try again later."
    },
    endMeeting: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "end_meeting",
      reason: "End meeting endpoint abuse",
      message: "Too many requests to end meeting endpoint. Please try again later."
    },
    freezeMeeting: {
      maxRequests: 10,
      windowMs: 60 * 1000,
      prefix: "freeze_meeting",
      reason: "Freeze meeting endpoint abuse",
      message: "Too many requests to freeze meeting endpoint. Please try again later."
    }
  }
}