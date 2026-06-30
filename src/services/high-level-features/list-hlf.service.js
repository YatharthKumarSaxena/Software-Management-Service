// services/high-level-features/list-hlf.service.js

const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const { HLF_ADMIN_LIST_FIELDS, HLF_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { logWithTime } = require("@utils/time-stamps.util");

const adminHlfListService = createListService({
    model: HighLevelFeatureModel,
    hiddenFields: HLF_ADMIN_LIST_FIELDS.hiddenFields,
    searchableFields: HLF_ADMIN_LIST_FIELDS.searchableFields,
    sortableFields: HLF_ADMIN_LIST_FIELDS.sortableFields,
    filterableFields: HLF_ADMIN_LIST_FIELDS.filterableFields
});

const clientHlfListService = createListService({
    model: HighLevelFeatureModel,
    hiddenFields: HLF_CLIENT_LIST_FIELDS.hiddenFields,
    searchableFields: HLF_CLIENT_LIST_FIELDS.searchableFields,
    sortableFields: HLF_CLIENT_LIST_FIELDS.sortableFields,
    filterableFields: HLF_CLIENT_LIST_FIELDS.filterableFields
});

const listHlfService = async ({ projectId, inceptionId, filters, userType }) => {
    try {
        const listService = userType === UserTypes.CLIENT ? clientHlfListService : adminHlfListService;

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
        logWithTime(`❌ [listHlfService] ${error.message}`);
        return { success: false, message: error.message || "Failed to list high-level features", errorCode: INTERNAL_ERROR };
    }
};

module.exports = { listHlfService };
