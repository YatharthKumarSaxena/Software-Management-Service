const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@/middlewares/factory/field-validation.middleware-factory");

/**
 * Meeting Field Validation Middlewares
 * 
 * Uses factory pattern for consistent field validation across all meeting operations.
 * Validates request body fields against defined validation rules (length, regex, enum).
 * 
 * Validation rules source:
 * - field-definitions.config.js → Field structure and required rules
 * - validation.config.js → Validation rules (length, enum, regex)
 * - validation-sets.config.js → Combined validation sets per operation
 * - field-definition.util.js → getValidationSet() utility
 */

const validationMiddlewares = {
  createMeetingValidationMiddleware: validateBody("createMeeting", validationSets.createMeetingValidationSet),
  updateMeetingValidationMiddleware: validateBody("updateMeeting", validationSets.updateMeetingValidationSet),
  cancelMeetingValidationMiddleware: validateBody("cancelMeeting", validationSets.cancelMeetingValidationSet),
  addParticipantValidationMiddleware: validateBody("addParticipant", validationSets.addParticipantValidationSet),
  updateParticipantValidationMiddleware: validateBody("updateParticipant", validationSets.updateParticipantValidationSet)
};

module.exports = { validationMiddlewares };

