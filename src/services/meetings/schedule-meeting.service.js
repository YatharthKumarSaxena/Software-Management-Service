// services/meetings/schedule-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { MeetingStatuses, MeetingPlatformTypes } = require("@configs/enums.config");
const { BAD_REQUEST, INTERNAL_ERROR, CONFLICT } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { validateMeetingLink, isTimeOverlapping, validatePlatform } = require("@utils/meeting-validation.util");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Schedules a meeting (transitions from DRAFT to SCHEDULED status)
 *
 * VALIDATION RULES:
 * 1. Meeting must exist and have status === DRAFT
 * 2. scheduledAt must be provided in payload (required)
 * 3. meetingLink must be provided in payload (required)
 * 4. platform resolution: payload.platform || meeting.platform, must have final value
 * 5. meetingLink must validate against platform regex
 * 6. Time conflict check: detect if any active participant has overlapping meeting
 * 7. expectedDuration: payload.expectedDuration || meeting.expectedDuration || 60 (default)
 *
 * UPDATE FIELDS:
 * - status → "SCHEDULED"
 * - scheduledAt
 * - meetingLink
 * - meetingPassword (if provided)
 * - platform (if provided)
 * - isScheduleFrozen → true
 * - updatedBy → userId
 *
 * @param {string} meetingId - Meeting ID to schedule
 * @param {Object} payload - Request payload
 * @param {Date} payload.scheduledAt - When meeting is scheduled (REQUIRED)
 * @param {string} payload.meetingLink - Meeting link (REQUIRED)
 * @param {string} [payload.meetingPassword] - Optional meeting password
 * @param {string} [payload.platform] - Optional platform (defaults to meeting.platform)
 * @param {number} [payload.expectedDuration] - Optional duration in minutes
 * @param {string} userId - User ID performing the action (for updatedBy)
 * @param {Object} auditContext - { user, device, requestId } for activity tracking
 *
 * @returns {Promise<{ success: true, meeting } | { success: false, message, errorCode }>}
 */
const scheduleMeetingService = async (meeting, project, payload, userId, auditContext = {}) => {
    try {
        const meetingId = meeting._id;

        logWithTime(`[scheduleMeetingService] Starting scheduling for meeting: ${meetingId}`);

        // ── 4. Resolve final values with fallback ───────────────────────────
        const finalScheduledAt = new Date(payload.scheduledAt);
        const finalMeetingLink = payload.meetingLink.trim();
        const finalPlatform = payload.platform || meeting.platform;
        const finalMeetingPassword = payload.meetingPassword || meeting.meetingPassword || null;
        const finalExpectedDuration = payload.expectedDuration || meeting.expectedDuration || 60;

        logWithTime(
            `[scheduleMeetingService] Final values resolved: ` +
            `platform=${finalPlatform}, duration=${finalExpectedDuration}min`
        );

        // ── 5. Validate platform ────────────────────────────────────────────
        if (!finalPlatform) {
            logWithTime(`⛔ [scheduleMeetingService] No platform available after fallback`);
            return {
                success: false,
                message: "Platform is required but not provided and meeting has no default",
                errorCode: BAD_REQUEST
            };
        }

        const platformValidation = validatePlatform(finalPlatform);
        if (!platformValidation.valid) {
            logWithTime(`⛔ [scheduleMeetingService] Platform validation failed: ${platformValidation.message}`);
            return {
                success: false,
                message: platformValidation.message,
                errorCode: BAD_REQUEST
            };
        }

        // ── 6. Validate meeting link against platform ───────────────────────
        const linkValidation = validateMeetingLink(finalPlatform, finalMeetingLink);
        if (!linkValidation.valid) {
            logWithTime(`⛔ [scheduleMeetingService] Link validation failed: ${linkValidation.message}`);
            return {
                success: false,
                message: linkValidation.message,
                errorCode: BAD_REQUEST
            };
        }

        logWithTime(`[scheduleMeetingService] ✓ Meeting link validated against ${finalPlatform}`);

        // ── Validate scheduledAt is in future ───────────────────────
        const now = new Date();

        if (finalScheduledAt.getTime() <= now.getTime()) {
            logWithTime(
                `⛔ [scheduleMeetingService] scheduledAt is not in future: ${finalScheduledAt}`
            );
            return {
                success: false,
                message: "scheduledAt must be a future date and time",
                errorCode: BAD_REQUEST
            };
        }

        // ── 7. Check time conflicts with active participants ────────────────
        const newStart = finalScheduledAt;
        const newEnd = new Date(newStart.getTime() + finalExpectedDuration * 60 * 1000);

        logWithTime(
            `[scheduleMeetingService] Checking time conflicts: ${newStart.toISOString()} to ${newEnd.toISOString()}`
        );

        // Get active participants (not deleted)
        const activeParticipants = meeting.participants
            .filter(p => !p.isDeleted)
            .map(p => p.userId);

        logWithTime(`[scheduleMeetingService] Active participants: ${activeParticipants.length}`);

        if (activeParticipants.length > 0) {
            // Query for any conflicting meetings
            const conflictingMeetings = await MeetingModel.find(
                {
                    _id: { $ne: meeting._id },
                    status: { $in: [MeetingStatuses.SCHEDULED, MeetingStatuses.ONGOING] },
                    scheduledAt: { $lt: newEnd },
                    $or: [
                        { endedAt: { $exists: true, $gt: newStart } },
                        { endedAt: { $exists: false } }
                    ],
                    "participants.userId": { $in: activeParticipants },
                    "participants.isDeleted": false
                },
                { participants: 1, scheduledAt: 1, endedAt: 1, expectedDuration: 1, title: 1 }
            ).lean();

            logWithTime(
                `[scheduleMeetingService] Found ${conflictingMeetings.length} potentially conflicting meetings`
            );

            // Check for participant conflicts with time overlap
            for (const conflictMeeting of conflictingMeetings) {
                const conflictStart = new Date(conflictMeeting.scheduledAt);
                const conflictEnd = conflictMeeting.endedAt
                    ? new Date(conflictMeeting.endedAt)
                    : new Date(conflictStart.getTime() + (conflictMeeting.expectedDuration || 60) * 60 * 1000);

                // Check if time windows overlap
                if (isTimeOverlapping(newStart, newEnd, conflictStart, conflictEnd)) {
                    // Find which participants overlap
                    const overlapParticipants = conflictMeeting.participants
                        .filter(p => !p.isDeleted && activeParticipants.includes(p.userId))
                        .map(p => p.userId);

                    if (overlapParticipants.length > 0) {
                        const participantsList = overlapParticipants.join(", ");
                        logWithTime(
                            `⛔ [scheduleMeetingService] Participant conflict: ${participantsList} already in "${conflictMeeting.title}"`
                        );
                        return {
                            success: false,
                            message: `Cannot schedule meeting. Participant(s) [${participantsList}] have a conflicting meeting: "${conflictMeeting.title}"`,
                            errorCode: CONFLICT
                        };
                    }
                }
            }
        }

        logWithTime(`[scheduleMeetingService] ✓ No time conflicts detected with active participants`);

        // ── 8. Update meeting ───────────────────────────────────────────────
        const oldMeeting = { ...meeting };

        const updatePayload = {
            status: MeetingStatuses.SCHEDULED,
            scheduledAt: finalScheduledAt,
            meetingLink: finalMeetingLink,
            platform: finalPlatform,
            meetingPassword: finalMeetingPassword,
            expectedDuration: finalExpectedDuration,
            updatedBy: userId
        };

        const updatedMeeting = await MeetingModel.findByIdAndUpdate(
            meetingId,
            { $set: updatePayload },
            { new: true }
        );

        if (!updatedMeeting) {
            logWithTime(`⛔ [scheduleMeetingService] Failed to update meeting ${meetingId}`);
            return {
                success: false,
                message: "Failed to schedule meeting",
                errorCode: INTERNAL_ERROR
            };
        }

        logWithTime(`✅ [scheduleMeetingService] Meeting scheduled successfully: ${meetingId}`);

        // ── 9. Version control ─────────────────────────────────────────────
        const { user, device, requestId } = auditContext || {};

        await versionControlService(
            project,
            `Meeting scheduled: status DRAFT → SCHEDULED, scheduled for ${finalScheduledAt.toISOString()}`,
            userId,
            { user, device, requestId }
        );

        // ── 10. Log activity tracker event ──────────────────────────────────
        const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.SCHEDULE_MEETING,
            `Meeting scheduled: status DRAFT → SCHEDULED, scheduled for ${finalScheduledAt.toISOString()}`,
            { oldData, newData }
        );

        return {
            success: true,
            meeting: updatedMeeting
        };
    } catch (error) {
        logWithTime(`❌ [scheduleMeetingService] Exception: ${error.message}`);
        return {
            success: false,
            message: `Internal error while scheduling meeting: ${error.message}`,
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = {
    scheduleMeetingService
};
