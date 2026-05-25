// services/inceptions/freeze-inception.service.js

const { Phases } = require("@configs/enums.config");
const { freezePhase } = require("@services/common/phase-management.service");

/**
 * Freezes an inception (marks isFrozen = true).
 *
 * @param {Object} inception - Inception document
 * @param {string} inception._id
 * @param {Object} params - Optional parameters
 * @param {string} params.frozenBy - Admin USR ID
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true } | { success: false, message }
 */
const freezeInceptionService = async (
  inception,
  { frozenBy, auditContext } = {}
) => {

  if (inception.isFrozen) {
    return {
      success: true,
      message: "Inception phase is already frozen"
    };
  }

  const success = await freezePhase(
    inception,
    Phases.INCEPTION,
    {
      ...auditContext,
      createdBy: frozenBy
    }
  );

  if (!success) {
    return {
      success: false,
      message: "Failed to freeze inception"
    };
  }

  return {
    success: true,
    message: "Inception Phase frozen successfully"
  };
};

module.exports = { freezeInceptionService };
