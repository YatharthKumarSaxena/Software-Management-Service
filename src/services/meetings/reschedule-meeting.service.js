// services/meetings/reschedule-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { MeetingStatuses } = require("@configs/enums.config");
const { BAD_REQUEST, INTERNAL_ERROR, CONFLICT, FORBIDDEN } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");const { logWithTime } = require("@utils/time-stamps.util");
const { validateMeetingLink, isTimeOverlapping, validatePlatform } = require("@utils/meeting-validation.util");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Reschedules a meeting (SCHEDULED status only)
 *
 * VALIDATION RULES:
 * 1. Meeting must exist and have status === SCHEDULED
 * 2. isScheduleFrozen must be false (cannot reschedule frozen meetings)
 * 3. No field is mandatory, but at least one change must be detected:
 *    - scheduledAt, meetingLink, platform, OR meetingPassword
 * 4. Platform resolution: payload.platform || meeting.platform (must have final value)
 * 5. Meeting link resolution: payload.meetingLink || meeting.meetingLink (must have final value)
 * 6. meetingLink must validate against finalPlatform regex
 * 7. Time conflict check: only if scheduledAt changed
 * 8. Check if any active participant has overlapping meeting
 *
 * UPDATE FIELDS (only if provided):
 * - scheduledAt (if provided)
 * - meetingLink (if provided)
 * - platform (if provided)
 * - meetingPassword (if provided)
 * - updatedBy → userId
 *
 * @param {string} meetingId - Meeting ID to reschedule
 * @param {Object} payload - Request payload (all fields optional)
 * @param {Date} [payload.scheduledAt] - New scheduled time
 * @param {string} [payload.meetingLink] - New meeting link
 * @param {string} [payload.platform] - New platform
 * @param {string} [payload.meetingPassword] - New meeting password
 * @param {string} userId - User ID performing the action
 * @param {Object} auditContext - { user, device, requestId } for activity tracking
 *
 * @returns {Promise<{ success: true, meeting } | { success: false, message, errorCode }>}
 */
const rescheduleMeetingService = async (meeting, project, payload, userId, auditContext = {}) => {
    try {
        const meetingId = meeting._id;
        logWithTime(`[rescheduleMeetingService] Starting rescheduling for meeting: ${meetingId}`);

        // ── 2. Validate meeting status ──────────────────────────────────────
        if (meeting.status !== MeetingStatuses.SCHEDULED) {
            logWithTime(
                `⛔ [rescheduleMeetingService] Meeting status is ${meeting.status}, expected SCHEDULED`
            );
            return {
                success: false,
                message: `Meeting cannot be rescheduled. Current status: ${meeting.status}. Only SCHEDULED meetings can be rescheduled.`,
                errorCode: BAD_REQUEST
            };
        }

        // ── 3. Check if meeting schedule is frozen ──────────────────────────
        if (meeting.isScheduleFrozen === true) {
            logWithTime(
                `⛔ [rescheduleMeetingService] Meeting schedule is frozen and cannot be rescheduled`
            );
            return {
                success: false,
                message: "Meeting schedule is frozen and cannot be rescheduled",
                errorCode: BAD_REQUEST // Using BAD_REQUEST instead of FORBIDDEN as per codebase pattern
            };
        }

        // ── 4. Detect changes ───────────────────────────────────────────────
        const scheduledAtChanged = payload.scheduledAt && new Date(payload.scheduledAt).getTime() !== new Date(meeting.scheduledAt).getTime();
        const meetingLinkChanged = payload.meetingLink && payload.meetingLink.trim() !== meeting.meetingLink;
        const platformChanged = payload.platform && payload.platform !== meeting.platform;
        const passwordChanged = payload.meetingPassword !== undefined && payload.meetingPassword !== meeting.meetingPassword;

        const changeDetected = scheduledAtChanged || meetingLinkChanged || platformChanged || passwordChanged;

        logWithTime(
            `[rescheduleMeetingService] Changes detected: ` +
            `scheduledAt=${scheduledAtChanged}, link=${meetingLinkChanged}, platform=${platformChanged}, password=${passwordChanged}`
        );

        if (!changeDetected) {
            logWithTime(`⛔ [rescheduleMeetingService] No changes detected in payload`);
            return {
                success: false,
                message: "No changes detected. Provide at least one field to reschedule: scheduledAt, meetingLink, platform, or meetingPassword",
                errorCode: BAD_REQUEST
            };
        }

        // ── 5. Resolve final values for validation ──────────────────────────
        const finalScheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : meeting.scheduledAt;
        const finalMeetingLink = payload.meetingLink ? payload.meetingLink.trim() : meeting.meetingLink;
        const finalPlatform = payload.platform || meeting.platform;
        const finalMeetingPassword = payload.meetingPassword !== undefined ? payload.meetingPassword : meeting.meetingPassword;

        logWithTime(
            `[rescheduleMeetingService] Final values resolved: platform=${finalPlatform}`
        );

        // ── 6. Validate platform ────────────────────────────────────────────
        if (!finalPlatform) {
            logWithTime(`⛔ [rescheduleMeetingService] No platform available after fallback`);
            return {
                success: false,
                message: "Platform is required but not provided",
                errorCode: BAD_REQUEST
            };
        }

        const platformValidation = validatePlatform(finalPlatform);
        if (!platformValidation.valid) {
            logWithTime(`⛔ [rescheduleMeetingService] Platform validation failed: ${platformValidation.message}`);
            return {
                success: false,
                message: platformValidation.message,
                errorCode: BAD_REQUEST
            };
        }

        // ── 7. Validate meeting link against platform ───────────────────────
        if (!finalMeetingLink) {
            logWithTime(`⛔ [rescheduleMeetingService] No meeting link available`);
            return {
                success: false,
                message: "Meeting link is required",
                errorCode: BAD_REQUEST
            };
        }

        const linkValidation = validateMeetingLink(finalPlatform, finalMeetingLink);
        if (!linkValidation.valid) {
            logWithTime(`⛔ [rescheduleMeetingService] Link validation failed: ${linkValidation.message}`);
            return {
                success: false,
                message: linkValidation.message,
                errorCode: BAD_REQUEST
            };
        }

        logWithTime(`[rescheduleMeetingService] ✓ Meeting link validated against ${finalPlatform}`);

        // ── 8. Check time conflicts if scheduledAt changed ──────────────────
        if (scheduledAtChanged) {
            const expectedDuration = meeting.expectedDuration || 60;
            const newStart = finalScheduledAt;
            const newEnd = new Date(newStart.getTime() + expectedDuration * 60 * 1000);

            logWithTime(
                `[rescheduleMeetingService] Checking time conflicts: ${newStart.toISOString()} to ${newEnd.toISOString()}`
            );

            // Get active participants (not deleted)
            const activeParticipants = meeting.participants
                .filter(p => !p.isDeleted)
                .map(p => p.userId);

            logWithTime(`[rescheduleMeetingService] Active participants: ${activeParticipants.length}`);

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
                    `[rescheduleMeetingService] Found ${conflictingMeetings.length} potentially conflicting meetings`
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
                                `⛔ [rescheduleMeetingService] Participant conflict: ${participantsList} already in "${conflictMeeting.title}"`
                            );
                            return {
                                success: false,
                                message: `Cannot reschedule meeting. Participant(s) [${participantsList}] have a conflicting meeting: "${conflictMeeting.title}"`,
                                errorCode: CONFLICT
                            };
                        }
                    }
                }
            }

            logWithTime(`[rescheduleMeetingService] ✓ No time conflicts detected`);
        }

        // ── 9. Update meeting ───────────────────────────────────────────────
        const oldMeeting = { ...meeting };

        const updatePayload = {};

        if (scheduledAtChanged) {
            updatePayload.scheduledAt = finalScheduledAt;
        }

        if (meetingLinkChanged) {
            updatePayload.meetingLink = finalMeetingLink;
        }

        if (platformChanged) {
            const linkToValidate = payload.meetingLink || meeting.meetingLink;

            const validation = validateMeetingLink(finalPlatform, linkToValidate);
            if (!validation.valid) {
                return {
                    success: false,
                    message: "Meeting link does not match new platform",
                    errorCode: BAD_REQUEST
                };
            }
            updatePayload.platform = finalPlatform;
        }

        if (passwordChanged) {
            updatePayload.meetingPassword = finalMeetingPassword;
        }

        updatePayload.updatedBy = userId;

        const updatedMeeting = await MeetingModel.findByIdAndUpdate(
            meetingId,
            { $set: updatePayload },
            { new: true }
        );

        if (!updatedMeeting) {
            logWithTime(`⛔ [rescheduleMeetingService] Failed to update meeting ${meetingId}`);
            return {
                success: false,
                message: "Failed to reschedule meeting",
                errorCode: INTERNAL_ERROR
            };
        }

        logWithTime(`✅ [rescheduleMeetingService] Meeting rescheduled successfully: ${meetingId}`);

        // ── 10. Version control ────────────────────────────────────────────
        const { user, device, requestId } = auditContext || {};
        const changes = [];
        if (scheduledAtChanged) changes.push(`scheduledAt: ${meeting.scheduledAt} → ${finalScheduledAt}`);
        if (meetingLinkChanged) changes.push(`meetingLink updated`);
        if (platformChanged) changes.push(`platform: ${meeting.platform} → ${finalPlatform}`);
        if (passwordChanged) changes.push(`meetingPassword updated`);

        await versionControlService(
            project,
            `Meeting rescheduled: ${changes.join(", ")}`,
            userId,
            { user, device, requestId }
        );

        // ── 11. Log activity tracker event ──────────────────────────────────
        const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.RESCHEDULE_MEETING,
            `Meeting rescheduled: ${changes.join(", ")}`,
            { oldData, newData }
        );

        return {
            success: true,
            meeting: updatedMeeting
        };
    } catch (error) {
        logWithTime(`❌ [rescheduleMeetingService] Exception: ${error.message}`);
        return {
            success: false,
            message: `Internal error while rescheduling meeting: ${error.message}`,
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = {
    rescheduleMeetingService
};
