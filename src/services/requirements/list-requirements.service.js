const { RequirementModel } = require("@models/requirement.model");

const {
    createListService
} = require("@services/factory/create-list-service.factory");

const {
    INTERNAL_ERROR
} = require("@configs/http-status.config");

const {
    UserTypes
} = require("@configs/enums.config");

const {
    REQUIREMENT_ADMIN_LIST_FIELDS,
    REQUIREMENT_CLIENT_LIST_FIELDS
} = require("@/configs/list-fields.config");

const { logWithTime } = require("@utils/time-stamps.util");

const adminRequirementListService =
    createListService({
        model: RequirementModel,
        hiddenFields: REQUIREMENT_ADMIN_LIST_FIELDS.hiddenFields,
        searchableFields: REQUIREMENT_ADMIN_LIST_FIELDS.searchableFields,
        sortableFields: REQUIREMENT_ADMIN_LIST_FIELDS.sortableFields,
        filterableFields: REQUIREMENT_ADMIN_LIST_FIELDS.filterableFields
    });

const clientRequirementListService =
    createListService({
        model: RequirementModel,
        hiddenFields: REQUIREMENT_CLIENT_LIST_FIELDS.hiddenFields,
        searchableFields: REQUIREMENT_CLIENT_LIST_FIELDS.searchableFields,
        sortableFields: REQUIREMENT_CLIENT_LIST_FIELDS.sortableFields,
        filterableFields: REQUIREMENT_CLIENT_LIST_FIELDS.filterableFields
    });

const listRequirementsService = async ({
    projectId,
    filters,
    userType
}) => {
    try {

        const listService =
            userType === UserTypes.CLIENT
                ? clientRequirementListService
                : adminRequirementListService;

        const andConditions = [
            {
                field: "projectId",
                operator: "eq",
                value: projectId
            },
            {
                field: "isDeleted",
                operator: "eq",
                value: false
            }
        ];

        if (filters?.query) {
            andConditions.push(
                filters.query
            );
        }

        const query = {
            and: andConditions
        };

        const result =
            await listService({
                query,
                selectFields:
                    filters?.selectFields,
                pageNumber:
                    filters?.pageNumber,
                pageSize:
                    filters?.pageSize,
                sortField:
                    filters?.sortField,
                sortOrder:
                    filters?.sortOrder
            });

        return result;

    } catch (error) {

        logWithTime(
            `❌ [listRequirementsService] ${error.message}`
        );

        return {
            success: false,
            message:
                error.message ||
                "Failed to list requirements",
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = {
    listRequirementsService
};