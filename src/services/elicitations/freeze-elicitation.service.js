// services/elicitations/freeze-elicitation.service.js

const { Phases } = require("@configs/enums.config");
const { freezePhase } = require("@services/common/phase-management.service");

/**
 * Freezes an elicitation (marks isFrozen = true).
 *
 * @param {Object} elicitation - Elicitation document
 * @param {string} elicitation._id
 * @param {Object} params - Optional parameters
 * @param {string} params.frozenBy - Admin USR ID
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true } | { success: false, message }
 */
const freezeElicitationService = async (
  elicitation,
  { frozenBy, auditContext } = {}
) => {

  if (elicitation.isFrozen) {
    return {
      success: true,
      message: "Elicitation phase is already frozen"
    };
  }

  const success = await freezePhase(
    elicitation,
    Phases.ELICITATION,
    {
      ...auditContext,
      createdBy: frozenBy
    }
  );

  if (!success) {
    return {
      success: false,
      message: "Failed to freeze elicitation"
    };
  }

  return {
    success: true,
    message: "Elicitation Phase frozen successfully"
  };
};

module.exports = { freezeElicitationService };
