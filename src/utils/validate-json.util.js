// utils/validate-json-query.util.js

const validateAndParseJson = (
    value,
    fieldName
) => {

    try {

        return {
            success: true,
            data: JSON.parse(value)
        };

    } catch {

        return {
            success: false,
            message:
                `Invalid JSON provided for ${fieldName}`
        };
    }
};

module.exports = {
    validateAndParseJson
};