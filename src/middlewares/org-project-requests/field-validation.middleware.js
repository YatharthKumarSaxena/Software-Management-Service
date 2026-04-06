// middlewares/org-project-requests/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

/**
 * Field validation middlewares for org project requests
 * These middlewares validate request body fields before processing
 */
const validationMiddlewares = {
  /**
   * Validates request body for creating org project request
   * Required fields: projectId, organizationId
   */
  createOrgProjectRequestValidationMiddleware: validateBody(
    "createOrgProjectRequest",
    validationSets.createOrgProjectRequestValidationSet
  ),

  /**
   * Validates request body for updating org project request
   * Optional fields: reasonDescription (for updating reason)
   */
  updateOrgProjectRequestValidationMiddleware: validateBody(
    "updateOrgProjectRequest",
    validationSets.updateOrgProjectRequestValidationSet
  ),

  /**
   * Validates request body for approving org project request
   * Required fields: reasonType, reasonDescription
   */
  approveOrgProjectRequestValidationMiddleware: validateBody(
    "approveOrgProjectRequest",
    validationSets.approveOrgProjectRequestValidationSet
  ),

  /**
   * Validates request body for rejecting org project request
   * Required fields: reasonType, reasonDescription
   */
  rejectOrgProjectRequestValidationMiddleware: validateBody(
    "rejectOrgProjectRequest",
    validationSets.rejectOrgProjectRequestValidationSet
  )
};

module.exports = { validationMiddlewares };
