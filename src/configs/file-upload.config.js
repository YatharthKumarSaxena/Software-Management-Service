const path = require("path");

const { getMyEnvAsNumber } = require("@utils/env.util");
const { TEMP_BASE } = require("@utils/bulk-import-temp.util");

module.exports = {
    REQUIREMENT_BULK_IMPORT_FILE_CONFIG: {

        uploadType: "array",

        maxFiles: getMyEnvAsNumber(
            "REQUIREMENT_BULK_IMPORT_MAX_FILES",
            10
        ),

        fieldName: "file",

        allowedExtensions: [
            ".xlsx",
            ".csv"
        ],

        allowedMimeTypes: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv"
        ],

        maxFileSizeMB: getMyEnvAsNumber(
            "REQUIREMENT_BULK_IMPORT_MAX_FILE_SIZE_MB",
            20
        ),

        destination: () => {
            return path.join(
                TEMP_BASE,
                "_staging"
            );
        },

        filename: (req, file) => {

            const extension = path
                .extname(file.originalname)
                .toLowerCase();

            const uniqueSuffix =
                `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

            return `chunk-${uniqueSuffix}${extension}`;

        }

    }
};