// services/participants/add-participant.service.js

const { MeetingModel } = require("@models/meeting.model");
const { BAD_REQUEST, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Adds a new participant to a meeting.
 * Cannot add if participant already exists as active (non-deleted).
 * Updates meeting version control and logs audit events.
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
        logWithTime(`[addParticipantService] Adding participant ${userId} to meeting ${meeting._id}`);

        
        // ── 1. Check if participant already exists as active ────────────────
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

        // ── 2. Check if participant was previously deleted, reactivate if needed ─
        const deletedParticipant = meeting.participants.find(
            p => p.userId === userId && p.isDeleted
        );

        let newParticipant;

        if (deletedParticipant) {
            // Reactivate deleted participant
            logWithTime(
                `[addParticipantService] Reactivating previously deleted participant ${userId}`
            );
            
            deletedParticipant.isDeleted = false;
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

        const oldMeeting = JSON.parse(JSON.stringify(meeting)); // Deep copy for audit

        // ── 3. Update meeting with new/reactivated participant ──────────────
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

        // ── 4. Update version control ──────────────────────────────────────
        const { user, device, requestId } = auditContext || {};
        await versionControlService(
            project,
            `Participant added: ${userId}`,
            addedBy,
            { user, device, requestId }
        );

        // ── 5. Log activity tracker event ──────────────────────────────────
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
