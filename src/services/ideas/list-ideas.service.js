// services/ideas/list-ideas.service.js

const { IdeaModel } = require("@models/idea.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const {
    IDEA_ADMIN_LIST_FIELDS,
    IDEA_CLIENT_LIST_FIELDS
} = require("@/configs/list-fields.config");
const { logWithTime } = require("@utils/time-stamps.util");

const adminIdeaListService = createListService({
    model: IdeaModel,
    hiddenFields: IDEA_ADMIN_LIST_FIELDS.hiddenFields,
    searchableFields: IDEA_ADMIN_LIST_FIELDS.searchableFields,
    sortableFields: IDEA_ADMIN_LIST_FIELDS.sortableFields,
    filterableFields: IDEA_ADMIN_LIST_FIELDS.filterableFields
});

const clientIdeaListService = createListService({
    model: IdeaModel,
    hiddenFields: IDEA_CLIENT_LIST_FIELDS.hiddenFields,
    searchableFields: IDEA_CLIENT_LIST_FIELDS.searchableFields,
    sortableFields: IDEA_CLIENT_LIST_FIELDS.sortableFields,
    filterableFields: IDEA_CLIENT_LIST_FIELDS.filterableFields
});

/**
 * Lists all ideas for a project with pagination and filtering.
 */
const listIdeasService = async ({
    projectId,
    filters,
    userType
}) => {
    try {
        const listService =
            userType === UserTypes.CLIENT
                ? clientIdeaListService
                : adminIdeaListService;

        const andConditions = [
            { field: "projectId", operator: "eq", value: projectId },
            { field: "isDeleted", operator: "eq", value: false }
        ];

        if (filters?.query) {
            andConditions.push(filters.query);
        }

        const query = { and: andConditions };

        const result = await listService({
            query,
            selectFields: filters?.selectFields,
            pageNumber: filters?.pageNumber,
            pageSize: filters?.pageSize,
            sortField: filters?.sortField,
            sortOrder: filters?.sortOrder
        });

        return result;
    } catch (error) {
        logWithTime(`❌ [listIdeasService] ${error.message}`);
        return {
            success: false,
            message: error.message || "Failed to list ideas",
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = { listIdeasService };
