const { validateRequiredColumns } = require("@/utils/validate-fields.util");
const {
    throwInternalServerError,
    logMiddlewareError,
    throwBadRequestError
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { cleanupUploadedFiles } = require("@/utils/bulk-import-temp.util");

const requiredColumnsCheck = (
    middlewareName,
    requiredColumns,
    options = {}
) => {

    return (req, res, next) => {

        try {

            // Supports both:
            // req.importData = {...}
            // req.importData = [{...}, {...}]
            const importDataList = Array.isArray(req.importData)
                ? req.importData
                : [req.importData];

            for (const importData of importDataList) {

                const headers = importData?.headers || [];

                const result = validateRequiredColumns(
                    headers,
                    requiredColumns,
                    options
                );

                if (!result.isValid) {

                    const messages = [];

                    if (result.missingColumns.length) {
                        messages.push(
                            `Missing required columns: ${result.missingColumns.join(", ")}`
                        );
                    }

                    if (result.duplicateColumns.length) {
                        messages.push(
                            `Duplicate columns found: ${result.duplicateColumns.join(", ")}`
                        );
                    }

                    cleanupUploadedFiles({
                        file: req.file,
                        files: req.files
                    });

                    logMiddlewareError(
                        middlewareName,
                        messages.join(" "),
                        req
                    );

                    return throwBadRequestError(
                        res,
                        messages.join(" "),
                        {
                            missingColumns: result.missingColumns,
                            duplicateColumns: result.duplicateColumns
                        }
                    );

                }

                importData.headers = result.cleanedHeaders;

            }

            logWithTime(
                `✅ [${middlewareName}] Required columns validation passed.`
            );

            return next();

        } catch (error) {

            logMiddlewareError(
                middlewareName,
                "Unexpected error while validating required columns.",
                req
            );

            cleanupUploadedFiles({
                file: req.file,
                files: req.files
            });

            return throwInternalServerError(
                res,
                error
            );

        }

    };

};

module.exports = {
    requiredColumnsCheck
};