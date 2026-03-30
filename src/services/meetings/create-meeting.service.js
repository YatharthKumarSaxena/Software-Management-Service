// services/meetings/create-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { NegotiationModel } = require("@models/negotiation.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { SpecificationModel } = require("@models/specification.model");
const { ValidationModel } = require("@models/validation.model");
const { InceptionModel } = require("@models/inception.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { MeetingStatuses, ParticipantTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { BAD_REQUEST, INTERNAL_ERROR, CONFLICT } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { addParticipantService } = require("@services/participants");

// ── Parent model mapping for entity types ──────────────────────────────
const PARENT_MODEL_MAP = {
    [DB_COLLECTIONS.ELICITATIONS]: ElicitationModel,
    [DB_COLLECTIONS.NEGOTIATIONS]: NegotiationModel,
    [DB_COLLECTIONS.ELABORATIONS]: ElaborationModel,
    [DB_COLLECTIONS.INCEPTIONS]: InceptionModel,
    [DB_COLLECTIONS.SPECIFICATIONS]: SpecificationModel,
    [DB_COLLECTIONS.VALIDATIONS]: ValidationModel
};

/**
 * Creates a new meeting document in the database.
 * 
 * EXPECTS from middleware:
 * - parentEntity: Already fetched Elicitation/Negotiation document
 * - entityType: Entity type (from DB_COLLECTIONS)
 * - entityId: Entity ID
 * - projectId: Project ID
 * - project: Project document for version control
 *
 * VALIDATION:
 * - If facilitatorId !== createdBy, validate facilitator is a stakeholder
 * - Otherwise, assume createdBy is authorized (already validated by middleware)
 *
 * @param {Object} params
 * @param {Object} params.parentEntity - Parent entity document
 * @param {string} params.entityType - Entity type (from DB_COLLECTIONS)
 * @param {string} params.projectId - Project ID
 * @param {Object} params.project - Project document for version control
 * @param {string} params.title - Meeting title
 * @param {string} [params.facilitatorId] - Facilitator ID (defaults to createdBy)
 * @param {string} [params.description] - Meeting description
 * @param {string} [params.meetingGroup] - Meeting group
 * @param {string} [params.platform] - Meeting platform
 * @param {string} params.createdBy - User ID who created (validated by middleware)
 * @param {Object} params.auditContext - { user, device, requestId }
 *
 * @returns {{ success: true, meeting } | { success: false, message }}
 */
const createMeetingService = async ({
    parentEntity,
    entityType,
    project,
    title,
    facilitatorId,
    description,
    meetingGroup,
    platform,
    createdBy,
    auditContext
}) => {
    try {

        const projectId = project._id;
        const entityId = parentEntity._id;

        logWithTime(`[createMeetingService] Creating meeting for ${entityType}`);

        // ── 1. Assign facilitator ──────────────────────────────────────────
        const assignedFacilitatorId = facilitatorId || createdBy;

        // ── 2. If facilitator differs from createdBy, validate stakeholder ─
        if (assignedFacilitatorId !== createdBy) {
            logWithTime(
                `[createMeetingService] Validating facilitator ${assignedFacilitatorId} is stakeholder`
            );

            const facilitatorStakeholder = await StakeholderModel.findOne({
                projectId,
                stakeholderId: assignedFacilitatorId,
                isDeleted: false
            }).lean();

            if (!facilitatorStakeholder) {
                logWithTime(
                    `⛔ [createMeetingService] Facilitator ${assignedFacilitatorId} is not a stakeholder of project ${projectId}`
                );
                return {
                    success: false,
                    message: `Facilitator is not a stakeholder of this project`,
                    errorCode: BAD_REQUEST
                };
            }
        }

        // ── 3. Validate allowParallelMeetings setting ──────────────────────
        if (parentEntity.allowParallelMeetings === false) {
            logWithTime(
                `[createMeetingService] allowParallelMeetings is FALSE - checking for active meetings...`
            );

            // Query meetings using meetingIds array (works with old and new meetings)
            let existingMeetings = [];
            if (parentEntity.meetingIds && parentEntity.meetingIds.length > 0) {
                existingMeetings = await MeetingModel.find(
                    {
                        _id: { $in: parentEntity.meetingIds },
                        status: {
                            $nin: [MeetingStatuses.COMPLETED, MeetingStatuses.CANCELLED]
                        }
                    },
                    { status: 1, title: 1, _id: 1 }
                ).lean();
            }

            logWithTime(
                `[createMeetingService] Meetings referenced: ${parentEntity.meetingIds ? parentEntity.meetingIds.length : 0}`
            );
            logWithTime(
                `[createMeetingService] Active meetings (not COMPLETED/CANCELLED): ${existingMeetings.length}`
            );

            if (existingMeetings.length > 0) {
                logWithTime(
                    `⛔ [createMeetingService] Parallel meetings disabled: Found ${existingMeetings.length} active meeting(s)`
                );
                const activeStatuses = existingMeetings.map(m => `${m.title} (${m.status})`).join(', ');
                logWithTime(
                    `⛔ [createMeetingService] Active meetings: ${activeStatuses}`
                );
                const existingMeetingTitle = existingMeetings[0].title;
                return {
                    success: false,
                    message: `Cannot create meeting: Parallel meetings are disabled for this ${entityType} phase`,
                    details: `Active meeting "${existingMeetingTitle}" exists. Complete or cancel it first.`,
                    errorCode: CONFLICT
                };
            } else {
                logWithTime(
                    `[createMeetingService] No active meetings found - meeting creation allowed`
                );
            }
        } else {
            logWithTime(
                `[createMeetingService] allowParallelMeetings is TRUE or not set - skipping conflict check (Value: ${parentEntity.allowParallelMeetings})`
            );
        }

        // ── 4. Create meeting document (without participants - will be added via service)
        const meetingData = {
            entityId,
            projectId,
            entityType,
            title: title.trim(),
            description: description ? description.trim() : undefined,
            facilitatorId: assignedFacilitatorId,
            meetingGroup: meetingGroup || undefined,
            platform: platform || undefined,
            status: MeetingStatuses.DRAFT,
            participants: [], // Empty initially
            createdBy
        };

        const meeting = new MeetingModel(meetingData);
        await meeting.save();

        logWithTime(`[createMeetingService] ✅ Meeting saved to DB | Meeting ID: ${meeting._id}, EntityId: ${meeting.entityId}, EntityType: ${meeting.entityType}, Status: ${meeting.status}`);
        logWithTime(`[createMeetingService] Meeting created, now adding facilitator as participant`);

        // ── 5. Add facilitator as first participant via participant service ─
        const addParticipantResult = await addParticipantService(
            meeting,
            project,
            {
                userId: assignedFacilitatorId,
                role: ParticipantTypes.FACILITATOR,
                addedBy: createdBy,
                auditContext
            }
        );

        if (!addParticipantResult.success) {
            logWithTime(
                `❌ [createMeetingService] Failed to add facilitator as participant: ${addParticipantResult.message}`
            );
            // Clean up: delete the meeting since participant addition failed
            await MeetingModel.findByIdAndDelete(meeting._id);
            return {
                success: false,
                message: `Failed to add facilitator as participant`,
                errorCode: INTERNAL_ERROR
            };
        }

        const meetingWithParticipant = addParticipantResult.meeting;

        // ── 6. Update parent entity's meetingIds array ─────────────────────
        const ParentModel = PARENT_MODEL_MAP[entityType];

        const updatedParentEntity = await ParentModel.findByIdAndUpdate(
            entityId,
            { $push: { meetingIds: meetingWithParticipant._id } },
            { returnDocument: 'after' }
        );

        logWithTime(`[createMeetingService] ✅ Parent Entity updated | EntityId: ${entityId}, MeetingIds count: ${updatedParentEntity.meetingIds ? updatedParentEntity.meetingIds.length : 0}`);

        // ── 7. Call version control service to update phase minor version ──
        const { user, device, requestId } = auditContext || {};
        await versionControlService(
            project,
            `Meeting created: "${title}"`,
            createdBy,
            { user, device, requestId }
        );

        // ── 8. Log activity tracker event ──────────────────────────────────
        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.CREATE_MEETING,
            `Meeting created: "${title}" in ${entityType} (Facilitator: ${assignedFacilitatorId})`,
            {
                newData: { meeting: meetingWithParticipant.toObject() },
                adminActions: { targetId: projectId?.toString() }
            }
        );

        logWithTime(`✅ [createMeetingService] Meeting created: ${meetingWithParticipant._id}`);

        return {
            success: true,
            meeting: meetingWithParticipant.toObject()
        };

    } catch (error) {
        logWithTime(`❌ [createMeetingService] Error: ${error.message}`);
        return {
            success: false,
            message: error.message || "Failed to create meeting",
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = { createMeetingService };