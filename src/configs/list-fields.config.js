// list-fields.config.js

const REQUIREMENT_ADMIN_LIST_FIELDS = {
    hiddenFields: [
        "__v"
    ],

    filterableFields: [
        "title",
        "status",
        "priority",
        "type",
        "createdBy",
        "createdAt",
        "updatedAt",
        "projectId",
        "entityId",
        "isDeleted"
    ],

    sortableFields: [
        "title",
        "priority",
        "status",
        "createdAt",
        "updatedAt",
        "sequence"
    ],

    searchableFields: [
        "title",
        "description",
        "tags"
    ]
};

const REQUIREMENT_CLIENT_LIST_FIELDS = {
    hiddenFields: [
        "__v",
        "reviewNotes",
        "decision",
        "governance",
        "deletedBy",
        "deletedAt",
        "updatedBy",
        "isAdminModified",
        "collaborators",
        "assigneeId",
        "isDeleted"
    ],

    filterableFields: [
        "title",
        "status",
        "priority",
        "type",
        "createdAt",
        "projectId",
        "entityId",
        "isDeleted"
    ],

    sortableFields: [
        "title",
        "priority",
        "createdAt",
        "sequence"
    ],

    searchableFields: [
        "title",
        "description"
    ]
};

const IDEA_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["title", "status", "projectId", "isDeleted"],
    sortableFields: ["title", "status", "createdAt", "updatedAt"],
    searchableFields: ["title", "description"]
};

const IDEA_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "deletedBy", "deletedAt", "createdBy", "updatedBy", "isDeleted", "decidedBy", "revokedBy"],
    filterableFields: ["title", "status", "projectId", "isDeleted"],
    sortableFields: ["title", "status", "createdAt"],
    searchableFields: ["title", "description"]
};

const HLF_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["title", "projectId", "inceptionId", "ideaId", "isDeleted"],
    sortableFields: ["title", "sequence", "createdAt", "updatedAt"],
    searchableFields: ["title", "description", "id"]
};

const HLF_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "createdBy", "updatedBy", "isDeleted", "deletedAt", "deletedBy"],
    filterableFields: ["title", "projectId", "inceptionId", "ideaId", "isDeleted"],
    sortableFields: ["title", "sequence", "createdAt"],
    searchableFields: ["title", "description", "id"]
};

const SCOPE_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["title", "type", "category", "projectId", "inceptionId", "featureId", "isDeleted"],
    sortableFields: ["title", "type", "sequence", "createdAt", "updatedAt"],
    searchableFields: ["title", "description", "id"]
};

const SCOPE_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "createdBy", "updatedBy", "isDeleted", "deletedAt", "deletedBy"],
    filterableFields: ["title", "type", "category", "projectId", "inceptionId", "featureId", "isDeleted"],
    sortableFields: ["title", "type", "sequence", "createdAt"],
    searchableFields: ["title", "description", "id"]
};

const CONSTRAINT_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["title", "type", "category", "projectId", "inceptionId", "featureId", "isDeleted"],
    sortableFields: ["title", "type", "sequence", "createdAt", "updatedAt"],
    searchableFields: ["title", "description", "id"]
};

const CONSTRAINT_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "createdBy", "updatedBy", "isDeleted", "deletedAt", "deletedBy"],
    filterableFields: ["title", "type", "category", "projectId", "inceptionId", "featureId", "isDeleted"],
    sortableFields: ["title", "type", "sequence", "createdAt"],
    searchableFields: ["title", "description", "id"]
};

const PHASE_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["projectId", "isDeleted", "status"],
    sortableFields: ["createdAt", "updatedAt"],
    searchableFields: []
};

const PHASE_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "createdBy", "updatedBy", "isDeleted", "deletedAt", "deletedBy"],
    filterableFields: ["projectId", "status", "isDeleted"],
    sortableFields: ["createdAt"],
    searchableFields: []
};

const PRODUCT_REQUEST_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["title", "status", "priority", "projectType", "clientId", "isDeleted"],
    sortableFields: ["createdAt", "updatedAt"],
    searchableFields: ["title", "description"]
};

const PRODUCT_REQUEST_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "internalNotes", "isDeleted", "deletedAt", "deletedBy"],
    filterableFields: ["title", "status", "priority", "projectType", "clientId", "isDeleted"],
    sortableFields: ["createdAt", "updatedAt"],
    searchableFields: ["title", "description"]
};

const ORG_PROJECT_REQUEST_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["status", "projectId", "clientId", "isDeleted"],
    sortableFields: ["createdAt", "updatedAt"],
    searchableFields: ["message"]
};

const ORG_PROJECT_REQUEST_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "internalNotes", "isDeleted", "deletedAt", "deletedBy"],
    filterableFields: ["status", "projectId", "clientId", "isDeleted"],
    sortableFields: ["createdAt", "updatedAt"],
    searchableFields: ["message"]
};

const MEETING_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["title", "status", "entityType", "entityId", "hostId", "isDeleted"],
    sortableFields: ["scheduledAt", "createdAt", "updatedAt"],
    searchableFields: ["title", "agenda"]
};

const MEETING_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "isDeleted", "deletedAt", "deletedBy", "createdBy", "updatedBy"],
    filterableFields: ["title", "status", "entityType", "entityId", "hostId", "isDeleted"],
    sortableFields: ["scheduledAt", "createdAt"],
    searchableFields: ["title", "agenda"]
};

const PROJECT_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["_id", "projectStatus", "currentPhase", "isArchived", "isDeleted", "createdBy"],
    sortableFields: ["createdAt", "updatedAt"],
    searchableFields: ["name", "description"]
};

const PROJECT_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "deletedAt", "deletedBy", "isDeleted"],
    filterableFields: ["_id", "projectStatus", "currentPhase", "isArchived", "isDeleted"],
    sortableFields: ["createdAt", "updatedAt"],
    searchableFields: ["name", "description"]
};

const STAKEHOLDER_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["projectId", "userId", "role", "phase", "isDeleted"],
    sortableFields: ["createdAt", "updatedAt"],
    searchableFields: []
};

const STAKEHOLDER_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "deletedAt", "deletedBy", "isDeleted"],
    filterableFields: ["projectId", "userId", "role", "phase", "isDeleted"],
    sortableFields: ["createdAt"],
    searchableFields: []
};

const ACTIVITY_TRACKER_ADMIN_LIST_FIELDS = {
    hiddenFields: ["__v"],
    filterableFields: ["eventType", "userId"],
    sortableFields: ["timestamp"],
    searchableFields: ["description"]
};

const ACTIVITY_TRACKER_CLIENT_LIST_FIELDS = {
    hiddenFields: ["__v", "adminActions"],
    filterableFields: ["eventType", "userId"],
    sortableFields: ["timestamp"],
    searchableFields: ["description"]
};

module.exports = {
    REQUIREMENT_ADMIN_LIST_FIELDS,
    REQUIREMENT_CLIENT_LIST_FIELDS,
    IDEA_ADMIN_LIST_FIELDS,
    IDEA_CLIENT_LIST_FIELDS,
    HLF_ADMIN_LIST_FIELDS,
    HLF_CLIENT_LIST_FIELDS,
    SCOPE_ADMIN_LIST_FIELDS,
    SCOPE_CLIENT_LIST_FIELDS,
    CONSTRAINT_ADMIN_LIST_FIELDS,
    CONSTRAINT_CLIENT_LIST_FIELDS,
    PHASE_ADMIN_LIST_FIELDS,
    PHASE_CLIENT_LIST_FIELDS,
    PRODUCT_REQUEST_ADMIN_LIST_FIELDS,
    PRODUCT_REQUEST_CLIENT_LIST_FIELDS,
    ORG_PROJECT_REQUEST_ADMIN_LIST_FIELDS,
    ORG_PROJECT_REQUEST_CLIENT_LIST_FIELDS,
    MEETING_ADMIN_LIST_FIELDS,
    MEETING_CLIENT_LIST_FIELDS,
    PROJECT_ADMIN_LIST_FIELDS,
    PROJECT_CLIENT_LIST_FIELDS,
    STAKEHOLDER_ADMIN_LIST_FIELDS,
    STAKEHOLDER_CLIENT_LIST_FIELDS,
    ACTIVITY_TRACKER_ADMIN_LIST_FIELDS,
    ACTIVITY_TRACKER_CLIENT_LIST_FIELDS
};