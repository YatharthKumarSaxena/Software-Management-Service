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

module.exports = {
    REQUIREMENT_ADMIN_LIST_FIELDS,
    REQUIREMENT_CLIENT_LIST_FIELDS
};