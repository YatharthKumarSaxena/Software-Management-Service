// services/elicitations/delete-elicitation.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Soft deletes an elicitation with deletion reason.
 *
 * @param {Object} elicitation - Elicitation document (already validated by middleware)
 * @param {Object} params
 * @param {string} params.deletionReasonType - Type of deletion reason (enum)
 * @param {string} params.deletionReasonDescription - Detailed reason (optional)
 * @param {string} params.deletedBy - User ID who deleted
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, elicitation } | { success: false, message }
 */
const deleteElicitationService = async (
  elicitation,
  {
    deletionReasonType,
    deletionReasonDescription,
    deletedBy,
    auditContext
  }
) => {
  try {
    // ── 1. Soft delete via atomic findByIdAndUpdate ────────────────
    const deletedElicitation = await ElicitationModel.findByIdAndUpdate(
      elicitation._id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
          deletionReasonType,
          deletionReasonDescription
        }
      },
      { new: true }
    );

    // ── 2. Log activity tracker event ───────────────────────────────
    if (deletedElicitation) {
      const { user, device, requestId } = auditContext || {};
      const { oldData, newData } = prepareAuditData(elicitation, deletedElicitation);

      logActivityTrackerEvent(
        user,
        device,
        requestId,
        ACTIVITY_TRACKER_EVENTS.DELETE_ELICITATION,
        `Elicitation soft-deleted. Reason: ${deletionReasonType}${deletionReasonDescription ? ` - ${deletionReasonDescription}` : ''}`,
        { oldData, newData }
      );

      logWithTime(
        `✅ [deleteElicitationService] Elicitation deleted: ${elicitation._id}`
      );
    }

    return {
      success: true,
      elicitation: deletedElicitation
    };

  } catch (error) {
    logWithTime(`❌ [deleteElicitationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { deleteElicitationService };
