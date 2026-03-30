// services/inceptions/update-inception.service.js

const { InceptionModel } = require("@models/inception.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");

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
  { allowParallelMeetings, updatedBy, auditContext }
) => {
  try {
    const { MeetingModel } = require("@models/meeting.model");
    const { MeetingStatuses } = require("@configs/enums.config");

    // ── 1. Check if any changes are being made ────────────────────────
    const allowParallelChanged = allowParallelMeetings !== undefined && inception.allowParallelMeetings !== allowParallelMeetings;

    if (!allowParallelChanged) {
      logWithTime(
        `⚠️ [updateInceptionService] No changes detected.`
      );
      return {
        success: true,
        message: "No changes detected"
      };
    }

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

    // ── 3. Build update payload ────────────────────────────────────────
    const updatePayload = { updatedBy, updatedAt: new Date() };
    
    if (allowParallelChanged) {
      updatePayload.allowParallelMeetings = allowParallelMeetings;
    }

    // ── 4. Update via atomic findByIdAndUpdate ────────────────────
    const updatedInception = await InceptionModel.findByIdAndUpdate(
      inception._id,
      { $set: updatePayload },
      { new: true }
    );

    // ── 5. Log activity tracker event (only if changed) ────────────
    if (updatedInception) {
      const { user, device, requestId } = auditContext || {};
      const { oldData, newData } = prepareAuditData(inception, updatedInception);

      let changeDesc = [];
      if (allowParallelChanged) changeDesc.push(`allowParallelMeetings: ${inception.allowParallelMeetings} → ${allowParallelMeetings}`);

      logActivityTrackerEvent(
        user,
        device,
        requestId,
        ACTIVITY_TRACKER_EVENTS.UPDATE_INCEPTION,
        `Inception updated: ${changeDesc.join(', ')}`,
        { oldData, newData }
      );

      logWithTime(
        `✅ [updateInceptionService] Inception updated: ${inception._id}`
      );
    }

    return {
      success: true,
      inception: updatedInception
    };

  } catch (error) {
    logWithTime(`❌ [updateInceptionService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { updateInceptionService };
