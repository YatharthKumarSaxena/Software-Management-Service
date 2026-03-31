// services/meetings/start-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { MeetingStatuses } = require("@configs/enums.config");
const { BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { versionControlService } = require("@services/common/version.service");

/**
 * Starts a meeting (transitions from SCHEDULED to ONGOING)
 *
 * VALIDATION RULES:
 * 1. Meeting must exist and have status === SCHEDULED
 * 2. No payload required
 *
 * UPDATE FIELDS:
 * - status → "ONGOING"
 * - startedAt → current date/time
 * - updatedBy → userId
 *
 * @param {Object} meeting - Meeting document
 * @param {Object} project - Project document for version control
 * @param {string} userId - User ID performing the action (for updatedBy)
 * @param {Object} auditContext - { user, device, requestId } for activity tracking
 *
 * @returns {Promise<{ success: true, meeting } | { success: false, message, errorCode }>}
 */
const startMeetingService = async (meeting, project, userId, auditContext = {}) => {
  try {
    const meetingId = meeting._id;

    logWithTime(`[startMeetingService] Starting meeting: ${meetingId}`);

    // ── Validate meeting status ─────────────────────────────────────────
    if (meeting.status !== MeetingStatuses.SCHEDULED) {
      logWithTime(
        `⛔ [startMeetingService] Meeting status is ${meeting.status}, expected SCHEDULED`
      );
      return {
        success: false,
        message: `Meeting cannot be started. Current status: ${meeting.status}. Only SCHEDULED meetings can be started.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Update meeting ──────────────────────────────────────────────────
    const oldMeeting = { ...meeting };
    const now = new Date();

    const updatePayload = {
      status: MeetingStatuses.ONGOING,
      startedAt: now,
      isScheduleFrozen: true, // Auto-freeze when meeting starts
      updatedBy: userId
    };

    const updatedMeeting = await MeetingModel.findByIdAndUpdate(
      meetingId,
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedMeeting) {
      logWithTime(`⛔ [startMeetingService] Failed to update meeting ${meetingId}`);
      return {
        success: false,
        message: "Failed to start meeting",
        errorCode: INTERNAL_ERROR
      };
    }

    logWithTime(
      `✅ [startMeetingService] Meeting started successfully: ${meetingId}, startedAt: ${now.toISOString()}`
    );

    // ── Version control ─────────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};

    await versionControlService(
      project,
      `Meeting started: status SCHEDULED → ONGOING at ${now.toISOString()}`,
      userId,
      { user, device, requestId }
    );

    // ── Log activity tracker event ──────────────────────────────────────
    const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.START_MEETING,
      `Meeting started: status SCHEDULED → ONGOING at ${now.toISOString()}`,
      { oldData, newData }
    );

    return {
      success: true,
      meeting: updatedMeeting
    };
  } catch (error) {
    logWithTime(`❌ [startMeetingService] Exception: ${error.message}`);
    return {
      success: false,
      message: `Internal error while starting meeting: ${error.message}`,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = {
  startMeetingService
};
