// middlewares/stakeholders/field-validation.middleware.js

const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");
const { FieldDefinitions } = require("@configs/field-definitions.config");
const { getValidationSet } = require("@utils/field-definition.util");

const createStakeholderValidationSet = getValidationSet(FieldDefinitions.CREATE_STAKEHOLDER);
const updateStakeholderValidationSet = getValidationSet(FieldDefinitions.UPDATE_STAKEHOLDER);
const deleteStakeholderValidationSet = getValidationSet(FieldDefinitions.DELETE_STAKEHOLDER);

const validationMiddlewares = {
  createStakeholderValidationMiddleware: validateBody("createStakeholder", createStakeholderValidationSet),
  updateStakeholderValidationMiddleware: validateBody("updateStakeholder", updateStakeholderValidationSet),
  deleteStakeholderValidationMiddleware: validateBody("deleteStakeholder", deleteStakeholderValidationSet),
};

module.exports = { validationMiddlewares };
