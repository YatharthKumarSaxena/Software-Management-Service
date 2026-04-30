// services/elicitations/delete-elicitation.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { ProjectModel } = require("@models/project.model");
const { Phases } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

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
    // ── 1. Check phase version - cannot delete if updated (version !== 0) ───
    if (elicitation.version && elicitation.version.major !== 0) {
      return {
        success: false,
        message: "Cannot delete phase. Phase has been updated and cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // ── 2. Soft delete via atomic findByIdAndUpdate ────────────────
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

    // ── 3. Remove phase from project currentPhase array ────────────────
    if (deletedElicitation) {
      await ProjectModel.findByIdAndUpdate(
        elicitation.projectId,
        { $pull: { currentPhase: Phases.ELICITATION } },
        { new: true }
      );
    }
// ── 4. Log activity tracker event ───────────────────────────────

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
      message: error.message,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { deleteElicitationService };
