// services/participants/remove-participant.service.js

const { MeetingModel } = require("@models/meeting.model");
const { BAD_REQUEST, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Removes (soft-deletes) a participant from a meeting.
 * Sets isDeleted=true, records removedBy and removedAt timestamp.
 * Cannot remove if participant doesn't exist or is already deleted.
 * Updates meeting version control and logs audit events.
 *
 * PARTICIPANT SCHEMA:
 * - userId: String (required)
 * - role: ParticipantTypes enum
 * - roleDescription: String (optional)
 * - addedBy: String (immutable)
 * - updatedBy: String (optional)
 * - isDeleted: Boolean (default: false) ← TOGGLED TO TRUE
 * - removedBy: String (optional) ← SET BY THIS SERVICE
 * - removedAt: Date (optional) ← SET BY THIS SERVICE
 *
 * @param {Object} meeting - Meeting document (already validated by middleware)
 * @param {Object} project - Project document for version control
 * @param {Object} params
 * @param {string} params.userId - User ID to remove as participant (required)
 * @param {string} params.removedBy - User ID who removed the participant (required)
 * @param {Object} params.auditContext - { user, device, requestId }
 *
 * @returns {{ success: true, participant, meeting } | { success: false, message, errorCode }}
 */
const removeParticipantService = async (
    meeting,
    project,
    { userId, removedBy, removeReason, auditContext }
) => {
    try {
        logWithTime(`[removeParticipantService] Removing participant ${userId} from meeting ${meeting._id}`);

        // ── 1. Find the participant ────────────────────────────────────────
        const participantIndex = meeting.participants.findIndex(
            p => p.userId === userId
        );

        if (participantIndex === -1) {
            logWithTime(
                `❌ [removeParticipantService] Participant ${userId} not found in meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Participant not found in this meeting`,
                errorCode: NOT_FOUND
            };
        }

        const participant = meeting.participants[participantIndex];

        // ── 2. Check if already deleted ────────────────────────────────────
        if (participant.isDeleted) {
            logWithTime(
                `⚠️ [removeParticipantService] Participant ${userId} is already removed from meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Participant is already removed from this meeting`,
                errorCode: BAD_REQUEST
            };
        }

        // ── 3. Protect facilitator from removal ─────────────────────────────
        if (meeting.facilitatorId && meeting.facilitatorId.toString() === userId) {
            logWithTime(
                `⚠️ [removeParticipantService] Cannot remove facilitator ${userId} from meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Cannot remove meeting facilitator. Assign new facilitator first.`,
                errorCode: BAD_REQUEST
            };
        }

        // ── 4. Protect project owner from removal ────────────────────────────
        if (project.ownerId === userId) {
            logWithTime(
                `⚠️ [removeParticipantService] Cannot remove project owner ${userId} from meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Cannot remove project owner from meeting.`,
                errorCode: BAD_REQUEST
            };
        }

        // ── 5. Soft-delete the participant ─────────────────────────────────
        meeting.participants[participantIndex].isDeleted = true;
        meeting.participants[participantIndex].removedBy = removedBy;
        meeting.participants[participantIndex].removedAt = new Date();
        meeting.participants[participantIndex].removeReason = removeReason;

        const oldMeeting = JSON.parse(JSON.stringify(meeting)); // Deep copy for audit
        oldMeeting.participants[participantIndex].isDeleted = false;
        oldMeeting.participants[participantIndex].removedBy = null;
        oldMeeting.participants[participantIndex].removedAt = null;
        oldMeeting.participants[participantIndex].removeReason = null;

        // ── 6. Update meeting in database ──────────────────────────────────
        const updatedMeeting = await MeetingModel.findByIdAndUpdate(
            meeting._id,
            { $set: { participants: meeting.participants } },
            { returnDocument: 'after' }
        );

        if (!updatedMeeting) {
            logWithTime(
                `❌ [removeParticipantService] Failed to update meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Failed to update meeting`,
                errorCode: INTERNAL_ERROR
            };
        }

        // ── 7. Update version control ──────────────────────────────────────
        const { user, device, requestId } = auditContext || {};
        await versionControlService(
            project,
            `Participant removed: ${userId}`,
            removedBy,
            { user, device, requestId }
        );

        // ── 8. Log activity tracker event ──────────────────────────────────
        const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.REMOVE_MEETING_MEMBER,
            `Participant ${userId} removed from meeting`,
            { oldData, newData }
        );

        logWithTime(
            `✅ [removeParticipantService] Participant removed: ${userId} from meeting ${meeting._id}`
        );

        return {
            success: true,
            participant: meeting.participants[participantIndex],
            meeting: updatedMeeting
        };

    } catch (error) {
        logWithTime(`❌ [removeParticipantService] Error: ${error.message}`);
        return {
            success: false,
            message: error.message,
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = { removeParticipantService };
