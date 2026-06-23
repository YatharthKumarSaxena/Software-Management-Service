// services/inceptions/update-inception.service.js

const { executePhaseUpdate } = require("@services/common/phase-update.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { Phases } = require("@configs/enums.config");
const { InceptionModel } = require("@/models");

/**
 * Updates an inception's mode and/or allowParallelMeetings.
 * 
 * For allowParallelMeetings toggle validation:
 *   - If meetingIds.length === 0: always allow toggle
 *   - If meetingIds.length > 0 AND toggling from true to false:
 *     - Fetch all meetings and check if any status is not COMPLETED/CANCELLED
 *     - If found, block the toggle
 *   - If toggling from false to true: always allow (no meeting check)
 *
 * @param {Object} inception - Inception document (already validated by middleware)
 * @param {Object} params
 * @param {string} [params.mode] - New inception mode
 * @param {boolean} [params.allowParallelMeetings] - Toggle parallel meetings
 * @param {string} params.updatedBy - User ID who updated
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, inception } | { success: false, message }
 */
const updateInceptionService = async (
  inception,
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
    const allowParallelChanged = allowParallelMeetings !== undefined && inception.allowParallelMeetings !== allowParallelMeetings;
    const workflowModeChanged = workflowMode !== undefined && inception.workflowMode !== workflowMode;
    const phaseStatusChanged = phaseStatus !== undefined && inception.phaseStatus !== phaseStatus;

    const documentChanged = allowParallelChanged || workflowModeChanged;

    // ── 2. If toggling allowParallelMeetings from true to false, validate meetings ────────
    if (allowParallelChanged && inception.allowParallelMeetings === true && allowParallelMeetings === false) {
      logWithTime(
        `🔍 [updateInceptionService] Validating meeting statuses before disabling parallel meetings`
      );
      
      // Check if there are any meetings
      if (inception.meetingIds && inception.meetingIds.length > 0) {
        // Fetch all meetings to check their status
        const meetings = await MeetingModel.find(
          { _id: { $in: inception.meetingIds }, isDeleted: false },
          { status: 1 }
        ).lean();

        // Check if any meeting is not COMPLETED or CANCELLED
        const ongoingMeetings = meetings.filter(m => 
          m.status !== MeetingStatuses.COMPLETED && m.status !== MeetingStatuses.CANCELLED
        );

        if (ongoingMeetings.length > 0) {
          logWithTime(
            `⛔ [updateInceptionService] Cannot disable parallel meetings: ${ongoingMeetings.length} ongoing/scheduled meetings found`
          );
          return {
            success: false,
            message: "Cannot disable parallel meetings while there are ongoing/scheduled meetings. Please complete or cancel all meetings before disabling this option."
          };
        }
      }
    }

    const changeDesc = [];
    if (allowParallelChanged) changeDesc.push(`allowParallelMeetings: ${inception.allowParallelMeetings} → ${allowParallelMeetings}`);
    if (workflowModeChanged) changeDesc.push(`workflowMode: '${inception.workflowMode}' → '${workflowMode}'`);

    const result = await executePhaseUpdate({
      phaseDocument: inception,
      phase: Phases.INCEPTION,
      phaseName: "Inception",
      requestedPhaseStatus: phaseStatus,
      phaseStatusChanged,
      documentChanged,
      updatedBy,
      auditContext,
      versionAction: `Inception update — version bump`,
      updateDocument: async currentInception => {
        const updatePayload = { updatedBy, updatedAt: new Date() };
        if (allowParallelChanged) updatePayload.allowParallelMeetings = allowParallelMeetings;
        if (workflowModeChanged) updatePayload.workflowMode = workflowMode;

        const updatedInception = await InceptionModel.findByIdAndUpdate(
          currentInception._id,
          { $set: updatePayload },
          { new: true }
        );
        const { user, device, requestId } = auditContext || {};
        const { oldData, newData } = prepareAuditData(currentInception, updatedInception);
        logActivityTrackerEvent(user, device, requestId, ACTIVITY_TRACKER_EVENTS.UPDATE_INCEPTION,
          `Inception updated: ${changeDesc.join(', ')}`, { oldData, newData });
        return updatedInception;
      }
    });

    return { ...result, inception: result.phaseDocument };

  } catch (error) {
    logWithTime(`❌ [updateInceptionService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { updateInceptionService };
