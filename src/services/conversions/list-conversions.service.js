// services/conversions/list-conversions.service.js

const { ConversionModel } = require("@models/conversion.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const { CONVERSION_ADMIN_LIST_FIELDS, CONVERSION_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { logWithTime } = require("@utils/time-stamps.util");

const adminConversionListService = createListService({
    model: ConversionModel,
    hiddenFields: CONVERSION_ADMIN_LIST_FIELDS.hiddenFields,
    searchableFields: CONVERSION_ADMIN_LIST_FIELDS.searchableFields,
    sortableFields: CONVERSION_ADMIN_LIST_FIELDS.sortableFields,
    filterableFields: CONVERSION_ADMIN_LIST_FIELDS.filterableFields
});

const clientConversionListService = createListService({
    model: ConversionModel,
    hiddenFields: CONVERSION_CLIENT_LIST_FIELDS.hiddenFields,
    searchableFields: CONVERSION_CLIENT_LIST_FIELDS.searchableFields,
    sortableFields: CONVERSION_CLIENT_LIST_FIELDS.sortableFields,
    filterableFields: CONVERSION_CLIENT_LIST_FIELDS.filterableFields
});

const listConversionsService = async ({ projectId, filters, userType }) => {
    try {
        const listService = userType === UserTypes.CLIENT ? clientConversionListService : adminConversionListService;

        const andConditions = [
            { field: "projectId", operator: "eq", value: projectId }
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
        logWithTime(`❌ [listConversionsService] ${error.message}`);
        return { success: false, message: error.message || "Failed to list conversions", errorCode: INTERNAL_ERROR };
    }
};

module.exports = { listConversionsService };
