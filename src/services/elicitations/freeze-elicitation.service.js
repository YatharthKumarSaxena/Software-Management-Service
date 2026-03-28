// services/elicitations/freeze-elicitation.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Freezes an elicitation (marks isFrozen = true).
 *
 * @param {Object} elicitation - Elicitation document
 * @param {string} elicitation._id
 * @param {Object} params
 * @param {string} params.frozenBy - Admin USR ID
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, elicitation } | { success: false, message }
 */
const freezeElicitationService = async (
  elicitation,
  { frozenBy, auditContext }
) => {
  try {
    // ── 1. Check if already frozen ────────────────────────────────────
    if (elicitation.isFrozen === true) {
      logWithTime(
        `⚠️ [freezeElicitationService] Elicitation already frozen: ${elicitation._id}`
      );
      return {
        success: true,
        message: "Already frozen"
      };
    }

    // ── 2. Freeze via atomic findByIdAndUpdate ───────────────────────
    const frozenElicitation = await ElicitationModel.findByIdAndUpdate(
      elicitation._id,
      {
        $set: {
          isFrozen: true,
          frozenBy,
          frozenAt: new Date()
        }
      },
      { new: true }
    );

    // ── 3. Log activity tracker event ────────────────────────────────
    if (frozenElicitation) {
      const { user, device, requestId } = auditContext || {};
      const { oldData, newData } = prepareAuditData(elicitation, frozenElicitation);

      logActivityTrackerEvent(
        user,
        device,
        requestId,
        ACTIVITY_TRACKER_EVENTS.FREEZE_ELICITATION,
        `Elicitation frozen - version ${frozenElicitation.version.major}.${frozenElicitation.version.minor}`,
        { oldData, newData }
      );

      logWithTime(
        `✅ [freezeElicitationService] Elicitation frozen: ${elicitation._id}`
      );
    }

    return {
      success: true,
      elicitation: frozenElicitation
    };

  } catch (error) {
    logWithTime(`❌ [freezeElicitationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { freezeElicitationService };
