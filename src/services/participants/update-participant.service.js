// services/participants/update-participant.service.js

const { MeetingModel } = require("@models/meeting.model");
const { BAD_REQUEST, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Updates a participant's editable fields (role and/or roleDescription).
 * Cannot update if participant doesn't exist or is already deleted.
 * Updates meeting version control and logs audit events.
 *
 * PARTICIPANT SCHEMA:
 * - userId: String (immutable)
 * - role: ParticipantTypes enum ← EDITABLE
 * - roleDescription: String (optional) ← EDITABLE
 * - addedBy: String (immutable)
 * - updatedBy: String ← UPDATED BY THIS SERVICE
 * - isDeleted: Boolean (immutable in this service)
 * - removedBy: String (immutable)
 * - removedAt: Date (immutable)
 *
 * @param {Object} meeting - Meeting document (already validated by middleware)
 * @param {Object} project - Project document for version control
 * @param {Object} params
 * @param {string} params.userId - User ID of participant to update (required)
 * @param {string} [params.role] - New role (ParticipantTypes enum)
 * @param {string} [params.roleDescription] - New role description (optional)
 * @param {string} params.updatedBy - User ID who performed update (required)
 * @param {Object} params.auditContext - { user, device, requestId }
 *
 * @returns {{ success: true, participant, meeting } | { success: false, message, errorCode }}
 */
const updateParticipantService = async (
    meeting,
    project,
    { userId, role, roleDescription, updatedBy, auditContext }
) => {
    try {
        logWithTime(`[updateParticipantService] Updating participant ${userId} in meeting ${meeting._id}`);

        // ── 1. Find the participant ────────────────────────────────────────
        const participantIndex = meeting.participants.findIndex(
            p => p.userId === userId
        );

        if (participantIndex === -1) {
            logWithTime(
                `❌ [updateParticipantService] Participant ${userId} not found in meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Participant not found in this meeting`,
                errorCode: NOT_FOUND
            };
        }

        const participant = meeting.participants[participantIndex];
        
        const roleChanged = role !== undefined && role !== participant.role;
        const descChanged = roleDescription !== undefined && roleDescription !== participant.roleDescription;

        if (!roleChanged && !descChanged) {
            logWithTime(
                `⚠️ [updateParticipantService] No changes detected for participant ${userId}`
            );
            return {
                success: true,
                message: "No changes detected",
                participant: null
            };
        }

        // ── 3. Check if participant is deleted ─────────────────────────────
        if (participant.isDeleted) {
            logWithTime(
                `❌ [updateParticipantService] Cannot update a deleted participant ${userId}`
            );
            return {
                success: false,
                message: `Cannot update a removed participant`,
                errorCode: BAD_REQUEST
            };
        }

        const oldMeeting = JSON.parse(JSON.stringify(meeting));

        // ── 4. Store old values for audit ──────────────────────────────────
        const oldRole = participant.role;
        const oldRoleDescription = participant.roleDescription;

        // ── 5. Build update payload ────────────────────────────────────────
        if (roleChanged) {
            meeting.participants[participantIndex].role = role;
        }
        if (descChanged) {
            meeting.participants[participantIndex].roleDescription = roleDescription;
        }

        meeting.participants[participantIndex].updatedBy = updatedBy;

        // ── 6. Update meeting in database ──────────────────────────────────
        const updatedMeeting = await MeetingModel.findByIdAndUpdate(
            meeting._id,
            { $set: { participants: meeting.participants } },
            { returnDocument: 'after' }
        );

        if (!updatedMeeting) {
            logWithTime(
                `❌ [updateParticipantService] Failed to update meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Failed to update meeting`,
                errorCode: INTERNAL_ERROR
            };
        }

        // ── 7. Update version control ──────────────────────────────────────
        const { user, device, requestId } = auditContext || {};
        const changes = [];
        if (roleChanged) changes.push(`role: ${oldRole} → ${role}`);
        if (descChanged) changes.push(`roleDescription: ${oldRoleDescription} → ${roleDescription}`);

        await versionControlService(
            project,
            `Participant updated: ${userId} (${changes.join(', ')})`,
            updatedBy,
            { user, device, requestId }
        );

        // ── 8. Log activity tracker event ──────────────────────────────────
        const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.UPDATE_MEETING_MEMBER,
            `Participant ${userId} updated: ${changes.join(', ')}`,
            { oldData, newData }
        );

        logWithTime(
            `✅ [updateParticipantService] Participant updated: ${userId} in meeting ${meeting._id}`
        );

        return {
            success: true,
            participant: meeting.participants[participantIndex],
            meeting: updatedMeeting
        };

    } catch (error) {
        logWithTime(`❌ [updateParticipantService] Error: ${error.message}`);
        return {
            success: false,
            message: error.message,
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = { updateParticipantService };
