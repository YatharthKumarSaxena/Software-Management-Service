// factory/document-filter.factory.js

const {
    INTERNAL_ERROR
} = require("@/configs/http-status.config");

const {
    logWithTime
} = require("@/utils/time-stamps.util");

const createDocumentFilterService = ({
    hiddenFields = []
}) => {

    return async ({
        document,
        selectFields = []
    }) => {

        try {

            if (!document) {
                return {
                    success: false,
                    message: "Document not found",
                    errorCode: INTERNAL_ERROR
                };
            }

            const data =
                document.toObject
                    ? document.toObject()
                    : { ...document };

            // Remove hidden fields
            hiddenFields.forEach(field => {
                delete data[field];
            });

            // Return all fields
            if (
                !Array.isArray(selectFields) ||
                selectFields.length === 0
            ) {
                return {
                    success: true,
                    data
                };
            }

            const filtered = {};

            selectFields.forEach(field => {

                if (field in data) {
                    filtered[field] = data[field];
                }

            });

            return {
                success: true,
                data: filtered
            };

        } catch (error) {

            logWithTime(
                `❌ [createDocumentFilterService] ${error.message}`
            );

            return {
                success: false,
                message: "Failed to filter document",
                errorCode: INTERNAL_ERROR
            };

        }

    };

};

module.exports = {
    createDocumentFilterService
};