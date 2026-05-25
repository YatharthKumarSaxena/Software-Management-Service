// services/elaborations/freeze-elaboration.service.js

const { Phases } = require("@configs/enums.config");
const { freezePhase } = require("@services/common/phase-management.service");

/**
 * Freezes an elaboration (marks isFrozen = true).
 *
 * @param {Object} elaboration - Elaboration document
 * @param {string} elaboration._id
 * @param {Object} params - Optional parameters
 * @param {string} params.frozenBy - Admin USR ID
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true } | { success: false, message }
 */
const freezeElaborationService = async (
  elaboration,
  { frozenBy, auditContext } = {}
) => {

  if (elaboration.isFrozen) {
    return {
      success: true,
      message: "Elaboration phase is already frozen"
    };
  }

  const success = await freezePhase(
    elaboration,
    Phases.ELABORATION,
    {
      ...auditContext,
      createdBy: frozenBy
    }
  );

  if (!success) {
    return {
      success: false,
      message: "Failed to freeze elaboration"
    };
  }

  return {
    success: true,
    message: "Elaboration Phase frozen successfully"
  };
};

module.exports = { freezeElaborationService };
