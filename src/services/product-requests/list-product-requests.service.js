// services/product-requests/list-product-requests.service.js

const { ProductRequestModel } = require("@models/product-request.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const { PRODUCT_REQUEST_ADMIN_LIST_FIELDS, PRODUCT_REQUEST_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { logWithTime } = require("@utils/time-stamps.util");

const adminProductRequestListService = createListService({
    model: ProductRequestModel,
    hiddenFields: PRODUCT_REQUEST_ADMIN_LIST_FIELDS.hiddenFields,
    searchableFields: PRODUCT_REQUEST_ADMIN_LIST_FIELDS.searchableFields,
    sortableFields: PRODUCT_REQUEST_ADMIN_LIST_FIELDS.sortableFields,
    filterableFields: PRODUCT_REQUEST_ADMIN_LIST_FIELDS.filterableFields
});

const clientProductRequestListService = createListService({
    model: ProductRequestModel,
    hiddenFields: PRODUCT_REQUEST_CLIENT_LIST_FIELDS.hiddenFields,
    searchableFields: PRODUCT_REQUEST_CLIENT_LIST_FIELDS.searchableFields,
    sortableFields: PRODUCT_REQUEST_CLIENT_LIST_FIELDS.sortableFields,
    filterableFields: PRODUCT_REQUEST_CLIENT_LIST_FIELDS.filterableFields
});

const listProductRequestsService = async ({ clientMongoId, isClient, filters, userType }) => {
    try {
        const listService = userType === UserTypes.CLIENT ? clientProductRequestListService : adminProductRequestListService;

        const andConditions = [
            { field: "isDeleted", operator: "eq", value: false }
        ];

        if (isClient && clientMongoId) {
            andConditions.push({ field: "requestedBy", operator: "eq", value: clientMongoId });
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

        return { isSuccess: true, data: result.data, pagination: result.pagination };
    } catch (error) {
        logWithTime(`❌ [listProductRequestsService] ${error.message}`);
        return { isSuccess: false, description: error.message || "Failed to list product requests", errorCode: INTERNAL_ERROR };
    }
};

module.exports = { listProductRequestsService };
