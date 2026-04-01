// services/participants/add-participant.service.js

const { MeetingModel } = require("@models/meeting.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { BAD_REQUEST, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { isTimeOverlapping } = require("@utils/meeting-validation.util");
const { MeetingStatuses } = require("@/configs/enums.config");

/**
 * Adds a new participant to a meeting.
 * Cannot add if participant already exists as active (non-deleted).
 * Updates meeting version control and logs audit events.
 *
 * VALIDATION RULES:
 * 1. Participant must be an active (non-deleted) stakeholder of the project
 * 2. Participant must not have overlapping meeting schedules
 * 3. Cannot add if participant already exists as active (non-deleted) in this meeting
 * 4. Cannot add to frozen meetings
 *
 * PARTICIPANT SCHEMA:
 * - userId: String (required, immutable)
 * - role: ParticipantTypes enum (default: PARTICIPANT)
 * - roleDescription: String (optional)
 * - addedBy: String (immutable)
 * - updatedBy: String (optional)
 * - isDeleted: Boolean (default: false)
 * - removedBy: String (optional)
 * - removedAt: Date (optional)
 * - timestamps: createdAt, updatedAt
 * - _id: true (each participant has unique _id)
 *
 * @param {Object} meeting - Meeting document (already validated by middleware)
 * @param {Object} project - Project document for version control
 * @param {Object} params
 * @param {string} params.userId - User ID to add as participant (required)
 * @param {string} [params.role] - Participant role (ParticipantTypes)
 * @param {string} [params.roleDescription] - Optional role description (e.g., "SCRIBE", "OBSERVER")
 * @param {string} params.addedBy - User ID who added the participant (required)
 * @param {Object} params.auditContext - { user, device, requestId }
 *
 * @returns {{ success: true, participant, meeting } | { success: false, message, errorCode }}
 */
const addParticipantService = async (
    meeting,
    project,
    { userId, role, roleDescription, addedBy, auditContext }
) => {
    try {
        if (meeting.isScheduleFrozen) {
            logWithTime(
                `⛔ [addParticipantService] Cannot add participant to frozen meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Cannot add participant to a frozen meeting`,
                errorCode: BAD_REQUEST
            };
        }

        logWithTime(`[addParticipantService] Adding participant ${userId} to meeting ${meeting._id}`);

        // ── 1. Validate stakeholder: User must be an active stakeholder of project ─
        const stakeholder = await StakeholderModel.findOne(
            {
                userId,
                projectId: project._id,
                isDeleted: false
            }
        ).lean();

        if (!stakeholder) {
            logWithTime(
                `⛔ [addParticipantService] User ${userId} is not a stakeholder of project ${project._id}`
            );
            return {
                success: false,
                message: `User must be a stakeholder of the project to be added as a meeting participant`,
                errorCode: BAD_REQUEST
            };
        }

        // ── 2. Validate time conflict: Check if user has overlapping meetings ──
        if (meeting.scheduledAt) {
            const meetingStart = new Date(meeting.scheduledAt);
            const meetingDuration = meeting.expectedDuration || 60; // Default 60 minutes
            const meetingEnd = new Date(meetingStart.getTime() + meetingDuration * 60000);

            logWithTime(
                `[addParticipantService] Checking time conflicts for user ${userId} (${meetingStart.toISOString()} - ${meetingEnd.toISOString()})`
            );

            // Calculate safe lower bound
            const lowerBoundTime = new Date(meetingStart.getTime() - 24 * 60 * 60 * 1000);

            // Find all meetings where user is an active participant around this time
            const userMeetings = await MeetingModel.find(
                {
                    "participants": {
                        $elemMatch: {
                            userId,
                            isDeleted: { $ne: true } // Safest check
                        }
                    },
                    _id: { $ne: meeting._id }, // Exclude current meeting
                    status: { $in: [MeetingStatuses.SCHEDULED, MeetingStatuses.ONGOING] },
                    scheduledAt: {
                        $lt: meetingEnd,
                        $gte: lowerBoundTime // FIX: Only fetch recent/relevant meetings
                    }
                }
            ).lean();

            // Check for time conflicts
            for (const userMeeting of userMeetings) {
                if (userMeeting.scheduledAt) {
                    const userMeetingStart = new Date(userMeeting.scheduledAt);
                    const userMeetingDuration = userMeeting.expectedDuration || 60;
                    const userMeetingEnd = new Date(userMeetingStart.getTime() + userMeetingDuration * 60000);

                    const hasConflict = isTimeOverlapping(
                        meetingStart,
                        meetingEnd,
                        userMeetingStart,
                        userMeetingEnd
                    );

                    if (hasConflict) {
                        logWithTime(
                            `⛔ [addParticipantService] User ${userId} has overlapping meeting at ${userMeetingStart.toISOString()}`
                        );
                        return {
                            success: false,
                            message: `User already has a meeting scheduled at this time. Overlapping meeting: ${userMeeting._id}`,
                            errorCode: BAD_REQUEST
                        };
                    }
                }
            }
        }

        // ── 3. Check if participant already exists as active ────────────────
        const existingParticipant = meeting.participants.find(
            p => p.userId === userId && !p.isDeleted
        );

        if (existingParticipant) {
            logWithTime(
                `⚠️ [addParticipantService] User ${userId} is already an active participant of meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `User is already a participant of this meeting`,
                errorCode: CONFLICT
            };
        }

        // ── 4. Check if participant was previously deleted, reactivate if needed ─
        const deletedParticipant = meeting.participants.find(
            p => p.userId === userId && p.isDeleted
        );

        let newParticipant;

        // ✅ FIX 3 APPLIED HERE: Create deep copy BEFORE any mutations happen!
        const oldMeeting = JSON.parse(JSON.stringify(meeting));

        if (deletedParticipant) {
            // Reactivate deleted participant
            logWithTime(
                `[addParticipantService] Reactivating previously deleted participant ${userId}`
            );

            deletedParticipant.isDeleted = false; // Original mutated, but oldMeeting is safe
            deletedParticipant.removedBy = null;
            deletedParticipant.removedAt = null;
            deletedParticipant.updatedBy = addedBy;

            if (role !== undefined) {
                deletedParticipant.role = role;
            }
            if (roleDescription !== undefined) {
                deletedParticipant.roleDescription = roleDescription;
            }

            newParticipant = deletedParticipant;
        } else {
            // Create new participant
            logWithTime(
                `[addParticipantService] Creating new participant ${userId}`
            );

            newParticipant = {
                userId,
                addedBy,
                role: role || undefined, // Let schema apply default
                roleDescription: roleDescription || undefined
            };
        }

        // ── 5. Update meeting with new/reactivated participant ──────────────
        meeting.participants = deletedParticipant
            ? meeting.participants // Already modified in place above
            : [...meeting.participants, newParticipant]; // Add new one

        const updatedMeeting = await MeetingModel.findByIdAndUpdate(
            meeting._id,
            { $set: { participants: meeting.participants } },
            { returnDocument: 'after' }
        );

        if (!updatedMeeting) {
            logWithTime(
                `❌ [addParticipantService] Failed to update meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Failed to update meeting`,
                errorCode: INTERNAL_ERROR
            };
        }

        // ── 6. Update version control ──────────────────────────────────────
        const { user, device, requestId } = auditContext || {};
        await versionControlService(
            project,
            `Participant added: ${userId}`,
            addedBy,
            { user, device, requestId }
        );

        // ── 7. Log activity tracker event ──────────────────────────────────
        const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.ADD_MEETING_MEMBER,
            `Participant ${userId} added with role: ${role || 'PARTICIPANT'}`,
            { oldData, newData }
        );

        logWithTime(
            `✅ [addParticipantService] Participant added: ${userId} to meeting ${meeting._id}`
        );

        return {
            success: true,
            participant: newParticipant,
            meeting: updatedMeeting
        };

    } catch (error) {
        logWithTime(`❌ [addParticipantService] Error: ${error.message}`);
        return {
            success: false,
            message: error.message,
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = { addParticipantService };
