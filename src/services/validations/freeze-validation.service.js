// services/validations/freeze-validation.service.js

const { Phases } = require("@configs/enums.config");
const { freezePhase } = require("@services/common/phase-management.service");

/**
 * Freezes a validation (marks isFrozen = true).
 *
 * @param {Object} validation - Validation document
 * @param {string} validation._id
 * @param {Object} params - Optional parameters
 * @param {string} params.frozenBy - Admin USR ID
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true } | { success: false, message }
 */
const freezeValidationService = async (
  validation,
  { frozenBy, auditContext } = {}
) => {

  if (validation.isFrozen) {
    return {
      success: true,
      message: "Validation phase is already frozen"
    };
  }

  const success = await freezePhase(
    validation,
    Phases.VALIDATION,
    {
      ...auditContext,
      createdBy: frozenBy
    }
  );

  if (!success) {
    return {
      success: false,
      message: "Failed to freeze validation"
    };
  }

  return {
    success: true,
    message: "Validation Phase frozen successfully"
  };
};

module.exports = { freezeValidationService };
