// services/constraints/list-constraint.service.js

const { ConstraintModel } = require("@models/constraints.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const { CONSTRAINT_ADMIN_LIST_FIELDS, CONSTRAINT_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { logWithTime } = require("@utils/time-stamps.util");

const adminConstraintListService = createListService({
    model: ConstraintModel,
    hiddenFields: CONSTRAINT_ADMIN_LIST_FIELDS.hiddenFields,
    searchableFields: CONSTRAINT_ADMIN_LIST_FIELDS.searchableFields,
    sortableFields: CONSTRAINT_ADMIN_LIST_FIELDS.sortableFields,
    filterableFields: CONSTRAINT_ADMIN_LIST_FIELDS.filterableFields
});

const clientConstraintListService = createListService({
    model: ConstraintModel,
    hiddenFields: CONSTRAINT_CLIENT_LIST_FIELDS.hiddenFields,
    searchableFields: CONSTRAINT_CLIENT_LIST_FIELDS.searchableFields,
    sortableFields: CONSTRAINT_CLIENT_LIST_FIELDS.sortableFields,
    filterableFields: CONSTRAINT_CLIENT_LIST_FIELDS.filterableFields
});

/**
 * Lists constraints for a project's inception with role-based field projection.
 *
 * @param {Object} params
 * @param {string} params.projectId - Project ID (required)
 * @param {string} params.inceptionId - Inception ID (optional)
 * @param {Object} params.filters - Parsed list filters from parseListFilters()
 * @param {string} params.userType - UserTypes.USER | UserTypes.CLIENT
 * @returns {{ success: boolean, data?: Array, pagination?: Object, message?: string }}
 */
const listConstraintsService = async ({ projectId, inceptionId, filters, userType }) => {
    try {
        const listService = userType === UserTypes.CLIENT ? clientConstraintListService : adminConstraintListService;

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
        logWithTime(`❌ [listConstraintsService] ${error.message}`);
        return { success: false, message: error.message || "Failed to list constraints", errorCode: INTERNAL_ERROR };
    }
};

module.exports = { listConstraintsService };
