// services/meetings/regenerate-meeting-link.service.js

const { MeetingModel } = require("@models/meeting.model");
const { MeetingStatuses } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { BAD_REQUEST, INTERNAL_ERROR, CONFLICT, SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { generateMeetingFromProvider } = require("./providers/meeting-provider.factory");

/**
 * Regenerates a meeting's link and provider details for an existing meeting.
 * Retrieves title, agenda, platform, and time context directly from MongoDB.
 * Does NOT require creation fields again.
 *
 * @param {Object} meeting - Existing meeting document (from req.foundMeeting)
 * @param {Object} project - Project document for version control
 * @param {Object} params
 * @param {boolean} [params.isMeetingPasswordRequired] - Optional boolean override
 * @param {string} params.updatedBy - User ID performing the action
 * @param {Object} [params.auditContext] - { user, device, requestId }
 *
 * @returns {Promise<{ success: boolean, meeting?: Object, message?: string, errorCode?: number, [key: string]: any }>}
 */
const regenerateMeetingLinkService = async (
  meeting,
  project,
  {
    isMeetingPasswordRequired,
    updatedBy,
    auditContext
  }
) => {
  try {
    const meetingId = meeting._id;
    logWithTime(`[regenerateMeetingLinkService] Regenerating meeting link for meeting: ${meetingId}`);

    // ── 1. Guard against finalized meetings ─────────────────────────────
    if (meeting.status === MeetingStatuses.COMPLETED || meeting.status === MeetingStatuses.CANCELLED) {
      logWithTime(`⛔ [regenerateMeetingLinkService] Cannot regenerate link for finalized meeting with status: ${meeting.status}`);
      return {
        success: false,
        message: `Cannot regenerate link: Meeting is already ${meeting.status}`,
        details: "Meeting link regeneration is only allowed for active or draft meetings.",
        errorCode: CONFLICT
      };
    }

    // ── 2. Retrieve provider context from existing MongoDB record ───────
    const platform = meeting.platform;
    const title = meeting.title;
    const agenda = meeting.description;
    const startTime = meeting.scheduledAt || new Date();
    const durationMinutes = meeting.expectedDuration || 30;

    const effectivePasswordRequired = Boolean(isMeetingPasswordRequired);

    logWithTime(
      `[regenerateMeetingLinkService] Retrieved MongoDB context: platform=${platform}, ` +
      `title="${title}", duration=${durationMinutes}min, passwordRequired=${effectivePasswordRequired}`
    );

    // ── 3. Call provider official API to generate fresh details ─────────
    const providerResult = await generateMeetingFromProvider({
      platform,
      title,
      agenda,
      startTime,
      durationMinutes,
      isMeetingPasswordRequired: effectivePasswordRequired,
      requestId: auditContext?.requestId
    });

    if (!providerResult.success) {
      logWithTime(`⛔ [regenerateMeetingLinkService] Provider link generation failed: ${providerResult.message}`);

      let errorCode = SERVICE_UNAVAILABLE;
      if (providerResult.isTimeout) {
        errorCode = GATEWAY_TIMEOUT;
      } else if (providerResult.isBadRequest) {
        errorCode = BAD_REQUEST;
      }

      // Existing meeting record in MongoDB remains untouched!
      return {
        success: false,
        message: providerResult.message,
        errorCode,
        isTimeout: providerResult.isTimeout || false,
        isUnavailable: providerResult.isUnavailable || false,
        action: providerResult.action || "RETRY_OR_MANUAL_LINK",
        fallbackAvailable: true,
        details: providerResult.details
      };
    }

    const {
      meetingLink,
      providerMeetingId,
      meetingPassword,
      passwordNote
    } = providerResult;

    logWithTime(`[regenerateMeetingLinkService] ✓ New link generated: ${meetingLink}, ProviderId: ${providerMeetingId}`);

    // ── 4. Update existing meeting record in MongoDB ────────────────────
    const oldMeeting = JSON.parse(JSON.stringify(meeting));

    const updatePayload = {
      meetingLink,
      meetingPassword: meetingPassword || null,
      updatedBy
    };

    const updatedMeeting = await MeetingModel.findByIdAndUpdate(
      meetingId,
      { $set: updatePayload },
      { returnDocument: 'after' }
    );

    if (!updatedMeeting) {
      logWithTime(`❌ [regenerateMeetingLinkService] Failed to update meeting record: ${meetingId}`);
      return {
        success: false,
        message: "Failed to update meeting record with regenerated link",
        errorCode: INTERNAL_ERROR
      };
    }

    // ── 5. Version control ─────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    await versionControlService(
      project,
      `Meeting link regenerated for "${title}" (${platform})`,
      updatedBy,
      { user, device, requestId }
    );

    // ── 6. Activity tracker event ──────────────────────────────────────
    const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

    logActivityTrackerEvent({
      user,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.REGENERATE_MEETING_LINK,
      description: `Meeting link regenerated for "${title}" on platform ${platform}`,
      logOptions: {
        oldData,
        newData,
        userActions: {
          targetId: updatedMeeting._id?.toString(),
          performedOn: DB_COLLECTIONS.MEETINGS
        }
      }
    });

    logWithTime(`✅ [regenerateMeetingLinkService] Meeting link regenerated successfully: ${meetingId}`);

    return {
      success: true,
      meeting: updatedMeeting.toObject(),
      passwordNote
    };

  } catch (error) {
    logWithTime(`❌ [regenerateMeetingLinkService] Unexpected error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to regenerate meeting link",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { regenerateMeetingLinkService };
