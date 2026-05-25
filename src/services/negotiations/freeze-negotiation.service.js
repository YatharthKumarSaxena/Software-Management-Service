// services/negotiations/freeze-negotiation.service.js

const { Phases } = require("@configs/enums.config");
const { freezePhase } = require("@services/common/phase-management.service");

/**
 * Freezes a negotiation (marks isFrozen = true).
 *
 * @param {Object} negotiation - Negotiation document
 * @param {string} negotiation._id
 * @param {Object} params - Optional parameters
 * @param {string} params.frozenBy - Admin USR ID
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true } | { success: false, message }
 */
const freezeNegotiationService = async (
  negotiation,
  { frozenBy, auditContext } = {}
) => {

  if (negotiation.isFrozen) {
    return {
      success: true,
      message: "Negotiation phase is already frozen"
    };
  }

  const success = await freezePhase(
    negotiation,
    Phases.NEGOTIATION,
    {
      ...auditContext,
      createdBy: frozenBy
    }
  );

  if (!success) {
    return {
      success: false,
      message: "Failed to freeze negotiation"
    };
  }

  return {
    success: true,
    message: "Negotiation Phase frozen successfully"
  };
};

module.exports = { freezeNegotiationService };
