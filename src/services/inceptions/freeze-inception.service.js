// services/inceptions/freeze-inception.service.js

const { InceptionModel } = require("@models/inception.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Freezes an inception (marks isFrozen = true).
 *
 * @param {Object} inception - Inception document
 * @param {string} inception._id
 * @param {Object} params
 * @param {string} params.frozenBy - Admin USR ID
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, inception } | { success: false, message }
 */
const freezeInceptionService = async (
  inception,
  { frozenBy, auditContext }
) => {
  try {
    // ── 1. Check if already frozen ────────────────────────────────────
    if (inception.isFrozen === true) {
      logWithTime(
        `⚠️ [freezeInceptionService] Inception already frozen: ${inception._id}`
      );
      return {
        success: true,
        message: "Already frozen"
      };
    }

    // ── 2. Freeze via atomic findByIdAndUpdate ───────────────────────
    const frozenInception = await InceptionModel.findByIdAndUpdate(
      inception._id,
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
    if (frozenInception) {
      const { user, device, requestId } = auditContext || {};
      const { oldData, newData } = prepareAuditData(inception, frozenInception);

      logActivityTrackerEvent(
        user,
        device,
        requestId,
        ACTIVITY_TRACKER_EVENTS.FREEZE_INCEPTION,
        `Inception frozen - version ${frozenInception.version.major}.${frozenInception.version.minor}`,
        { oldData, newData }
      );

      logWithTime(
        `✅ [freezeInceptionService] Inception frozen: ${inception._id}`
      );
    }

    return {
      success: true,
      inception: frozenInception
    };

  } catch (error) {
    logWithTime(`❌ [freezeInceptionService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { freezeInceptionService };
