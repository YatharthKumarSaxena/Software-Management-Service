// services/meetings/update-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { ParticipantTypes, ProjectRoleTypes } = require("@configs/enums.config");
const { UNAUTHORIZED, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { addParticipantService, updateParticipantService } = require("@services/participants");

/**
 * Updates a meeting's editable fields.
 * Only allowed if status is DRAFT.
 * Only FACILITATOR or PROJECT OWNER can update the meeting.
 * Editable fields: title, description, meetingGroup, platform, facilitatorId
 *
 * AUTHORIZATION:
 * - Allow update ONLY IF:
 *   * req.participant.role === FACILITATOR (in this meeting)
 *   OR
 *   * req.stakeholder.role === OWNER (in the project)
 * - If neither condition is true, throw UNAUTHORIZED error
 *
 * PARTICIPANT LIFECYCLE:
 * - If facilitatorId changes, use participant services:
 *   * OLD FACILITATOR: updateParticipantService to change role to PARTICIPANT
 *   * NEW FACILITATOR: 
 *     - If exists: updateParticipantService to change role to FACILITATOR
 *     - If not exists: addParticipantService to add as FACILITATOR
 *
 * EXPECTS from middleware (req):
 * - project: Project document for version control
 * - participant: { role } - User's role in this meeting
 * - stakeholder: { role } - User's role in the project
 * - parentEntity: Parent entity (Elicitation/Negotiation) - optional
 *
 * @param {Object} meeting - Meeting document (already validated by middleware)
 * @param {Object} project - Project document for version control
 * @param {Object} params
 * @param {string} [params.title] - New title
 * @param {string} [params.description] - New description
 * @param {string} [params.meetingGroup] - New meeting group
 * @param {string} [params.platform] - New platform
 * @param {string} [params.facilitatorId] - New facilitator ID
 * @param {string} params.updatedBy - User ID who updated
 * @param {Object} params.participantRole - req.participant.role (from middleware)
 * @param {Object} params.stakeholderRole - req.stakeholder?.role (from middleware)
 * @param {Object} params.auditContext - { user, device, requestId }
 *
 * @returns {{ success: true, meeting } | { success: false, message, errorCode }}
 */
const updateMeetingService = async (
    meeting,
    project,
    {
        title,
        description,
        meetingGroup,
        platform,
        facilitatorId,
        updatedBy,
        participantRole,
        stakeholderRole,
        auditContext
    }
) => {
    try {
        logWithTime(`[updateMeetingService] Updating meeting ${meeting._id}`);

        // ── 1. AUTHORIZATION CHECK (VERY BEGINNING) ───────────────────────
        // Allow update ONLY IF user is FACILITATOR OR PROJECT OWNER
        const isFacilitator = participantRole === ParticipantTypes.FACILITATOR;
        const isAllowedProjectRole = stakeholderRole === ProjectRoleTypes.OWNER || stakeholderRole === ProjectRoleTypes.MANAGER;

        if (!isAllowedProjectRole && !isFacilitator) {
            logWithTime(
                `❌ [updateMeetingService] User ${updatedBy} not authorized. Must be meeting FACILITATOR or project OWNER`
            );
            return {
                success: false,
                message: `Not authorized. Only meeting facilitators or project owners can update meetings`,
                errorCode: UNAUTHORIZED
            };
        }

        // ── 2. Check if any changes are being made ─────────────────────────
        const titleChanged = title !== undefined && meeting.title !== title;
        const descChanged = description !== undefined && meeting.description !== description;
        const groupChanged = meetingGroup !== undefined && meeting.meetingGroup !== meetingGroup;
        const platformChanged = platform !== undefined && meeting.platform !== platform;
        const facilitatorChanged = facilitatorId !== undefined && meeting.facilitatorId !== facilitatorId;

        if (!titleChanged && !descChanged && !groupChanged && !platformChanged && !facilitatorChanged) {
            logWithTime(
                `⚠️ [updateMeetingService] No changes detected.`
            );
            return {
                success: true,
                message: "No changes detected"
            };
        }

        // ── 3. Handle facilitator change via participant services ──────────
        if (facilitatorChanged) {

            if (isFacilitator && !isAllowedProjectRole) {
                logWithTime(
                    `❌ [updateMeetingService] User ${updatedBy} is FACILITATOR and not PROJECT OWNER, cannot change facilitator`
                );
                return {
                    success: false,
                    message: `Not authorized to change facilitator. Only project owners can change the facilitator.`,
                    errorCode: UNAUTHORIZED
                };
            }

            logWithTime(
                `[updateMeetingService] Facilitator change detected: ${meeting.facilitatorId} → ${facilitatorId}`
            );

            // A. Change old facilitator role from FACILITATOR to PARTICIPANT
            const oldFacilitatorUpdateResult = await updateParticipantService(
                meeting,
                project,
                {
                    userId: meeting.facilitatorId,
                    role: ParticipantTypes.PARTICIPANT,
                    updatedBy,
                    auditContext
                }
            );

            if (!oldFacilitatorUpdateResult.success) {
                logWithTime(
                    `⚠️ [updateMeetingService] Could not update old facilitator to PARTICIPANT: ${oldFacilitatorUpdateResult.message}`
                );
                // This is non-blocking; we'll continue since the old facilitator might already be a participant
            } else {
                // Refresh meeting from database to get latest state
                meeting = await MeetingModel.findById(meeting._id).lean();
                logWithTime(
                    `[updateMeetingService] Old facilitator role updated to PARTICIPANT`
                );
            }

            // B. Check if new facilitator already exists in participants
            const newFacilitatorParticipant = meeting.participants.find(
                p => p.userId === facilitatorId && !p.isDeleted
            );

            if (newFacilitatorParticipant) {
                // New facilitator exists, update their role to FACILITATOR
                logWithTime(
                    `[updateMeetingService] New facilitator exists as participant, updating role to FACILITATOR`
                );

                const updateNewFacilitatorResult = await updateParticipantService(
                    meeting,
                    project,
                    {
                        userId: facilitatorId,
                        role: ParticipantTypes.FACILITATOR,
                        updatedBy,
                        auditContext
                    }
                );

                if (!updateNewFacilitatorResult.success) {
                    logWithTime(
                        `❌ [updateMeetingService] Failed to update new facilitator role: ${updateNewFacilitatorResult.message}`
                    );
                    return {
                        success: false,
                        message: `Failed to update new facilitator role`,
                        errorCode: INTERNAL_ERROR
                    };
                }

                // Refresh meeting from database
                meeting = await MeetingModel.findById(meeting._id).lean();
            } else {
                // New facilitator doesn't exist, add as FACILITATOR
                logWithTime(
                    `[updateMeetingService] New facilitator is not a participant, adding as FACILITATOR`
                );

                const addNewFacilitatorResult = await addParticipantService(
                    meeting,
                    project,
                    {
                        userId: facilitatorId,
                        role: ParticipantTypes.FACILITATOR,
                        addedBy: updatedBy,
                        auditContext
                    }
                );

                if (!addNewFacilitatorResult.success) {
                    logWithTime(
                        `❌ [updateMeetingService] Failed to add new facilitator: ${addNewFacilitatorResult.message}`
                    );
                    return {
                        success: false,
                        message: `Failed to add new facilitator as participant`,
                        errorCode: INTERNAL_ERROR
                    };
                }

                // Refresh meeting from database
                meeting = await MeetingModel.findById(meeting._id).lean();
            }
        }

        // ── 4. Build update payload (meeting fields only) ──────────────────
        const updatePayload = { updatedBy };

        if (titleChanged) updatePayload.title = title;
        if (descChanged) updatePayload.description = description;
        if (groupChanged) updatePayload.meetingGroup = meetingGroup;
        if (platformChanged) updatePayload.platform = platform;
        if (facilitatorChanged) updatePayload.facilitatorId = facilitatorId;

        // ── 5. Update meeting fields in database ───────────────────────────
        const oldMeeting = JSON.parse(JSON.stringify(meeting));

        const updatedMeeting = await MeetingModel.findByIdAndUpdate(
            meeting._id,
            { $set: updatePayload },
            { new: true }
        );

        if (!updatedMeeting) {
            logWithTime(
                `❌ [updateMeetingService] Failed to update meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Failed to update meeting`,
                errorCode: INTERNAL_ERROR
            };
        }

        // ── 6. Call version control service ────────────────────────────────
        const { user, device, requestId } = auditContext || {};
        const changes = [];
        if (titleChanged) changes.push(`title: '${meeting.title}' → '${title}'`);
        if (descChanged) changes.push(`description updated`);
        if (groupChanged) changes.push(`meetingGroup: ${meeting.meetingGroup} → ${meetingGroup}`);
        if (platformChanged) changes.push(`platform: ${meeting.platform} → ${platform}`);
        if (facilitatorChanged) changes.push(`facilitatorId: ${meeting.facilitatorId} → ${facilitatorId}`);

        await versionControlService(
            project,
            `Meeting updated: ${changes.join(', ')}`,
            updatedBy,
            { user, device, requestId }
        );

        // ── 7. Log activity tracker event ──────────────────────────────────
        const { oldData, newData } = prepareAuditData(oldMeeting, updatedMeeting);

        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.UPDATE_MEETING,
            `Meeting updated: ${changes.join(', ')}`,
            { oldData, newData }
        );

        logWithTime(
            `✅ [updateMeetingService] Meeting updated: ${meeting._id}`
        );

        return {
            success: true,
            meeting: updatedMeeting
        };

    } catch (error) {
        logWithTime(`❌ [updateMeetingService] Error: ${error.message}`);
        return {
            success: false,
            message: error.message,
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = { updateMeetingService };
