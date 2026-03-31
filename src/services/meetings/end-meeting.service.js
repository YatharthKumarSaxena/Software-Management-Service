// services/meetings/end-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { MeetingStatuses } = require("@configs/enums.config");
const { BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Ends a meeting (transitions from ONGOING to COMPLETED)
 *
 * VALIDATION RULES:
 * 1. Meeting must exist and have status === ONGOING
 * 2. No payload required
 *
 * UPDATE FIELDS:
 * - status → "COMPLETED"
 * - endedAt → current date/time
 * - updatedBy → userId
 *
 * @param {string} meetingId - Meeting ID to end
 * @param {string} userId - User ID performing the action (for updatedBy)
 * @param {Object} auditContext - { user, device, requestId } for activity tracking
 *
 * @returns {Promise<{ success: true, meeting } | { success: false, message, errorCode }>}
 */
const endMeetingService = async (meeting, project, userId, auditContext = {}) => {
  try {

    const meetingId = meeting._id;

    logWithTime(`[endMeetingService] Starting end meeting process for: ${meetingId}`);

    // ── 2. Validate meeting status ──────────────────────────────────────
    if (meeting.status !== MeetingStatuses.ONGOING) {
      logWithTime(
        `⛔ [endMeetingService] Meeting status is ${meeting.status}, expected ONGOING`
      );
      return {
        success: false,
        message: `Meeting cannot be ended. Current status: ${meeting.status}. Only ONGOING meetings can be ended.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── 3. Update meeting ───────────────────────────────────────────────
    const oldMeeting = { ...meeting };
    const now = new Date();

    const updatePayload = {
      status: MeetingStatuses.COMPLETED,
      endedAt: now,
      updatedBy: userId
    };

    const updatedMeeting = await MeetingModel.findByIdAndUpdate(
      meetingId,
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedMeeting) {
      logWithTime(`⛔ [endMeetingService] Failed to update meeting ${meetingId}`);
      return {
        success: false,
        message: "Failed to end meeting",
        errorCode: INTERNAL_ERROR
      };
    }

    logWithTime(
      `✅ [endMeetingService] Meeting ended successfully: ${meetingId}, endedAt: ${now.toISOString()}`
    );

    // ── 4. Version control ──────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};

    await versionControlService(
      project,
      `Meeting ended: status ONGOING → COMPLETED at ${now.toISOString()}`,
      userId,
      { user, device, requestId }
    );

    // ── 5. Log activity tracker event ───────────────────────────────────
    const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.END_MEETING,
      `Meeting ended: status ONGOING → COMPLETED at ${now.toISOString()}`,
      { oldData, newData }
    );

    return {
      success: true,
      meeting: updatedMeeting
    };
  } catch (error) {
    logWithTime(`❌ [endMeetingService] Exception: ${error.message}`);
    return {
      success: false,
      message: `Internal error while ending meeting: ${error.message}`,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = {
  endMeetingService
};
