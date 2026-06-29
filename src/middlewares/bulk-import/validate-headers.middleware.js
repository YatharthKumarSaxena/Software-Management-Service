const { requiredColumnsCheck } = require("@middlewares/factory/check-required-column.middleware-factory");
const { requiredFields } = require("@configs/required-fields.config");
const { createRequirementField } = requiredFields;

const validateHeaderColumnMiddlewares = {
    createRequirementInBulkHeaderValidationMiddleware: requiredColumnsCheck("createRequirementInBulkHeaderValidation", createRequirementField)
};

module.exports = {
    validateHeaderColumnMiddlewares
};