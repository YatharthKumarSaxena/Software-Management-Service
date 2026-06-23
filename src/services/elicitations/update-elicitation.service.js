// services/elicitations/update-elicitation.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { executePhaseUpdate } = require("@services/common/phase-update.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { Phases } = require("@configs/enums.config");

/**
 * Updates an elicitation's mode, and/or allowParallelMeetings.
 * 
 * For allowParallelMeetings toggle validation:
 *   - If meetingIds.length === 0: always allow toggle
 *   - If meetingIds.length > 0 AND toggling from true to false:
 *     - Fetch all meetings and check if any status is not COMPLETED/CANCELLED
 *     - If found, block the toggle
 *   - If toggling from false to true: always allow (no meeting check)
 *
 * @param {Object} elicitation - Elicitation document (already validated by middleware)
 * @param {Object} params
 * @param {string} [params.workflowMode]               - New workflow mode
 * @param {boolean} [params.allowParallelMeetings]     - Toggle parallel meetings
 * @param {string} params.updatedBy                    - User ID who updated
 * @param {Object} params.auditContext                 - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, elicitation } | { success: false, message }
 */
const updateElicitationService = async (
  elicitation,
  { 
    allowParallelMeetings,
    workflowMode,
    phaseStatus,
    updatedBy, 
    auditContext 
  }
) => {
  try {
    const { MeetingModel } = require("@models/meeting.model");
    const { MeetingStatuses } = require("@configs/enums.config");

    // ── 1. Check if any changes are being made ────────────────────────
    const workflowModeChanged = workflowMode !== undefined && elicitation.workflowMode !== workflowMode;
    const allowParallelChanged = allowParallelMeetings !== undefined && elicitation.allowParallelMeetings !== allowParallelMeetings;
    const phaseStatusChanged = phaseStatus !== undefined && elicitation.phaseStatus !== phaseStatus;

    const documentChanged = workflowModeChanged || allowParallelChanged;

    // ── 2. If toggling allowParallelMeetings from true to false, validate meetings ────────
    if (allowParallelChanged && elicitation.allowParallelMeetings === true && allowParallelMeetings === false) {
      logWithTime(
        `🔍 [updateElicitationService] Validating meeting statuses before disabling parallel meetings`
      );

      // Check if there are any meetings
      if (elicitation.meetingIds && elicitation.meetingIds.length > 0) {
        // Fetch all meetings to check their status
        const meetings = await MeetingModel.find(
          { _id: { $in: elicitation.meetingIds }, isDeleted: false },
          { status: 1 }
        ).lean();

        // Check if any meeting is not COMPLETED or CANCELLED
        const ongoingMeetings = meetings.filter(m =>
          m.status !== MeetingStatuses.COMPLETED && m.status !== MeetingStatuses.CANCELLED
        );

        if (ongoingMeetings.length > 0) {
          logWithTime(
            `⛔ [updateElicitationService] Cannot disable parallel meetings: ${ongoingMeetings.length} ongoing/scheduled meetings found`
          );
          return {
            success: false,
            message: "Mode change not possible due to ongoing meetings"
          };
        }
      }
    }

    const changeDesc = [];
    if (workflowModeChanged) changeDesc.push(`workflowMode: '${elicitation.workflowMode}' → '${workflowMode}'`);
    if (allowParallelChanged) changeDesc.push(`allowParallelMeetings: ${elicitation.allowParallelMeetings} → ${allowParallelMeetings}`);

    const result = await executePhaseUpdate({
      phaseDocument: elicitation,
      phase: Phases.ELICITATION,
      phaseName: "Elicitation",
      requestedPhaseStatus: phaseStatus,
      phaseStatusChanged,
      documentChanged,
      updatedBy,
      auditContext,
      versionAction: "Elicitation update — version bump",
      updateDocument: async currentElicitation => {
        const updatePayload = { updatedBy, updatedAt: new Date() };
        if (workflowModeChanged) updatePayload.workflowMode = workflowMode;
        if (allowParallelChanged) updatePayload.allowParallelMeetings = allowParallelMeetings;

        const updatedElicitation = await ElicitationModel.findByIdAndUpdate(
          currentElicitation._id, { $set: updatePayload }, { new: true }
        );
        const { user, device, requestId } = auditContext || {};
        const { oldData, newData } = prepareAuditData(currentElicitation, updatedElicitation);
        logActivityTrackerEvent(user, device, requestId, ACTIVITY_TRACKER_EVENTS.UPDATE_ELICITATION,
          `Elicitation updated: ${changeDesc.join(', ')}`, { oldData, newData });
        return updatedElicitation;
      }
    });

    return { ...result, elicitation: result.phaseDocument };

  } catch (error) {
    logWithTime(`❌ [updateElicitationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { updateElicitationService };
