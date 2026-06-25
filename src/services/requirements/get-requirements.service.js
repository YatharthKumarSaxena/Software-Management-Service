const {
    createDocumentFilterService
} = require("@services/factory/create-doc-filter-service.factory");

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

const {
    logWithTime
} = require("@utils/time-stamps.util");

const adminRequirementGetService =
    createDocumentFilterService({
        hiddenFields:
            REQUIREMENT_ADMIN_LIST_FIELDS.hiddenFields
    });

const clientRequirementGetService =
    createDocumentFilterService({
        hiddenFields:
            REQUIREMENT_CLIENT_LIST_FIELDS.hiddenFields
    });

const getRequirementService = async ({
    requirement,
    selectFields,
    userType
}) => {

    try {

        const getService =
            userType === UserTypes.CLIENT
                ? clientRequirementGetService
                : adminRequirementGetService;

        const result =
            await getService({
                document: requirement,
                selectFields
            });

        return result;

    } catch (error) {

        logWithTime(
            `❌ [getRequirementService] ${error.message}`
        );

        return {
            success: false,
            message:
                error.message ||
                "Failed to get requirement",
            errorCode: INTERNAL_ERROR
        };

    }

};

module.exports = {
    getRequirementService
};