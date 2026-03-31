// services/meetings/freeze-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { MeetingStatuses } = require("@configs/enums.config");
const { BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { versionControlService } = require("@services/common/version.service");

/**
 * Freezes a meeting (locks it from further modifications)
 *
 * VALIDATION RULES:
 * 1. Meeting must exist
 * 2. Meeting must have status === ONGOING or SCHEDULED
 * 3. Cannot be already frozen
 *
 * UPDATE FIELDS:
 * - isScheduleFrozen → true
 * - updatedBy → userId
 *
 * EFFECT:
 * - Prevents rescheduling of the meeting
 * - Prevents further participant management changes
 *
 * @param {Object} meeting - Meeting document
 * @param {Object} project - Project document for version control
 * @param {string} userId - User ID performing the action (for updatedBy)
 * @param {Object} auditContext - { user, device, requestId } for activity tracking
 *
 * @returns {Promise<{ success: true, meeting } | { success: false, message, errorCode }>}
 */
const freezeMeetingService = async (meeting, project, userId, auditContext = {}) => {
  try {
    const meetingId = meeting._id;

    logWithTime(`[freezeMeetingService] Freezing meeting: ${meetingId}`);

    // ── Validate meeting status ─────────────────────────────────────────
    const allowedStatuses = [MeetingStatuses.SCHEDULED, MeetingStatuses.ONGOING];
    if (!allowedStatuses.includes(meeting.status)) {
      logWithTime(
        `⛔ [freezeMeetingService] Meeting status is ${meeting.status}, expected SCHEDULED or ONGOING`
      );
      return {
        success: false,
        message: `Meeting cannot be frozen. Current status: ${meeting.status}. Only SCHEDULED or ONGOING meetings can be frozen.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Check if already frozen ─────────────────────────────────────────
    if (meeting.isScheduleFrozen === true) {
      logWithTime(
        `⛔ [freezeMeetingService] Meeting ${meetingId} is already frozen`
      );
      return {
        success: false,
        message: "Meeting is already frozen",
        errorCode: BAD_REQUEST
      };
    }

    // ── Update meeting ──────────────────────────────────────────────────
    const oldMeeting = { ...meeting };

    const updatePayload = {
      isScheduleFrozen: true,
      updatedBy: userId
    };

    const updatedMeeting = await MeetingModel.findByIdAndUpdate(
      meetingId,
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedMeeting) {
      logWithTime(`⛔ [freezeMeetingService] Failed to update meeting ${meetingId}`);
      return {
        success: false,
        message: "Failed to freeze meeting",
        errorCode: INTERNAL_ERROR
      };
    }

    logWithTime(
      `✅ [freezeMeetingService] Meeting frozen successfully: ${meetingId}`
    );

    // ── Version control ─────────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};

    await versionControlService(
      project,
      `Meeting frozen: isScheduleFrozen set to true, status: ${meeting.status}`,
      userId,
      { user, device, requestId }
    );

    // ── Log activity tracker event ──────────────────────────────────────
    const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.FREEZE_MEETING,
      `Meeting frozen: prevented from further modifications`,
      { oldData, newData }
    );

    return {
      success: true,
      meeting: updatedMeeting
    };
  } catch (error) {
    logWithTime(`❌ [freezeMeetingService] Exception: ${error.message}`);
    return {
      success: false,
      message: `Internal error while freezing meeting: ${error.message}`,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = {
  freezeMeetingService
};
