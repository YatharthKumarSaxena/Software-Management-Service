// services/specifications/freeze-specification.service.js

const { Phases } = require("@configs/enums.config");
const { freezePhase } = require("@services/common/phase-management.service");

/**
 * Freezes a specification (marks isFrozen = true).
 *
 * @param {Object} specification - Specification document
 * @param {string} specification._id
 * @param {Object} params - Optional parameters
 * @param {string} params.frozenBy - Admin USR ID
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true } | { success: false, message }
 */
const freezeSpecificationService = async (
  specification,
  { frozenBy, auditContext } = {}
) => {

  if (specification.isFrozen) {
    return {
      success: true,
      message: "Specification phase is already frozen"
    };
  }

  const success = await freezePhase(
    specification,
    Phases.SPECIFICATION,
    {
      ...auditContext,
      createdBy: frozenBy
    }
  );

  if (!success) {
    return {
      success: false,
      message: "Failed to freeze specification"
    };
  }

  return {
    success: true,
    message: "Specification Phase frozen successfully"
  };
};

module.exports = { freezeSpecificationService };
