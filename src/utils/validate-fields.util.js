/**
 * Generic Utility to check for missing fields and trim string values
 * @param {Object} data - req.body, req.query, or req.params
 * @param {Array} requiredFields - ["email", "password", "userId"]
 */
const validateMissingFields = (data, requiredFields) => {
    const missingFields = [];
    const cleanedData = { ...data }; // Original data ko mutate karne se bachne ke liye copy

    requiredFields.forEach((field) => {
        let value = cleanedData[field];

        // 1. Check if field is missing (undefined, null, or empty string)
        if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
            missingFields.push(field);
        } else {
            // 2. Agar string hai toh Trim kar do
            if (typeof value === "string") {
                cleanedData[field] = value.trim();
            }
        }
    });

    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields,
        cleanedData: cleanedData
    };
};

/**
 * Validate Required Columns in CSV/Excel
 *
 * @param {string[]} headers
 * @param {string[]} requiredColumns
 *
 * @returns {{
 *   isValid: boolean,
 *   missingColumns: string[],
 *   cleanedHeaders: string[]
 * }}
 */
const validateRequiredColumns = (
    headers = [],
    requiredColumns = [],
    {
        ignoreCase = true,
        trim = true
    } = {}
) => {

    const normalize = (value) => {

        value = String(value);

        if (trim) {
            value = value.trim();
        }

        if (ignoreCase) {
            value = value.toLowerCase();
        }

        return value;
    };

    const normalizedHeaders = headers.map(normalize);

    const headerSet = new Set(normalizedHeaders);

    const missingColumns = requiredColumns.filter(
        column => !headerSet.has(normalize(column))
    );

    const duplicateColumns = [
        ...new Set(
            normalizedHeaders.filter(
                (header, index) => normalizedHeaders.indexOf(header) !== index
            )
        )
    ];

    return {
        isValid: missingColumns.length === 0 && duplicateColumns.length === 0,
        missingColumns,
        duplicateColumns,
        cleanedHeaders: headers
    };
};

module.exports = {
    validateMissingFields,
    validateRequiredColumns
};