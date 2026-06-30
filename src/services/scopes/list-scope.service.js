// services/scopes/list-scope.service.js

const { ScopeModel } = require("@models/scope-model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const { SCOPE_ADMIN_LIST_FIELDS, SCOPE_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { logWithTime } = require("@utils/time-stamps.util");

const adminScopeListService = createListService({
    model: ScopeModel,
    hiddenFields: SCOPE_ADMIN_LIST_FIELDS.hiddenFields,
    searchableFields: SCOPE_ADMIN_LIST_FIELDS.searchableFields,
    sortableFields: SCOPE_ADMIN_LIST_FIELDS.sortableFields,
    filterableFields: SCOPE_ADMIN_LIST_FIELDS.filterableFields
});

const clientScopeListService = createListService({
    model: ScopeModel,
    hiddenFields: SCOPE_CLIENT_LIST_FIELDS.hiddenFields,
    searchableFields: SCOPE_CLIENT_LIST_FIELDS.searchableFields,
    sortableFields: SCOPE_CLIENT_LIST_FIELDS.sortableFields,
    filterableFields: SCOPE_CLIENT_LIST_FIELDS.filterableFields
});

const listScopesService = async ({ projectId, inceptionId, filters, userType }) => {
    try {
        const listService = userType === UserTypes.CLIENT ? clientScopeListService : adminScopeListService;

        const andConditions = [
            { field: "projectId", operator: "eq", value: projectId },
            { field: "isDeleted", operator: "eq", value: false }
        ];

        if (inceptionId) {
            andConditions.push({ field: "inceptionId", operator: "eq", value: inceptionId });
        }

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
        logWithTime(`❌ [listScopesService] ${error.message}`);
        return { success: false, message: error.message || "Failed to list scopes", errorCode: INTERNAL_ERROR };
    }
};

module.exports = { listScopesService };
