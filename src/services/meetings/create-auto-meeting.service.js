// services/meetings/create-auto-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { NegotiationModel } = require("@models/negotiation.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { SpecificationModel } = require("@models/specification.model");
const { ValidationModel } = require("@models/validation.model");
const { InceptionModel } = require("@models/inception.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { MeetingStatuses, ParticipantTypes, MeetingPlatformTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { BAD_REQUEST, INTERNAL_ERROR, CONFLICT, SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { addParticipantService } = require("@services/participants");
const { generateMeetingFromProvider } = require("./providers/meeting-provider.factory");
const { getDefaultMeetingDurationMinutes } = require("./providers/provider-config");

// Parent model mapping for entity types
const PARENT_MODEL_MAP = {
  [DB_COLLECTIONS.ELICITATIONS]: ElicitationModel,
  [DB_COLLECTIONS.NEGOTIATIONS]: NegotiationModel,
  [DB_COLLECTIONS.ELABORATIONS]: ElaborationModel,
  [DB_COLLECTIONS.INCEPTIONS]: InceptionModel,
  [DB_COLLECTIONS.SPECIFICATIONS]: SpecificationModel,
  [DB_COLLECTIONS.VALIDATIONS]: ValidationModel
};

/**
 * Creates a meeting with automatically generated provider meeting link and details.
 * Supports Google Meet, Microsoft Teams, and Zoom.
 *
 * @param {Object} params
 * @param {Object} params.parentEntity - Parent entity document
 * @param {string} params.entityType - Entity type (from DB_COLLECTIONS)
 * @param {Object} params.project - Project document for version control
 * @param {string} params.title - Meeting title
 * @param {string} [params.description] - Meeting description
 * @param {string} [params.agenda] - Meeting agenda (alias for description)
 * @param {string} [params.facilitatorId] - Facilitator ID (defaults to createdBy)
 * @param {string} [params.meetingGroup] - Meeting group
 * @param {string} [params.platform] - Meeting platform (GOOGLE_MEET, TEAMS, ZOOM)
 * @param {boolean} [params.isMeetingPasswordRequired] - Whether password is required
 * @param {Date|string} [params.scheduledAt] - Optional scheduled date/time
 * @param {number} [params.expectedDuration] - Optional duration in minutes
 * @param {string} params.createdBy - User ID who created
 * @param {Object} params.auditContext - { user, device, requestId }
 *
 * @returns {Promise<{ success: boolean, meeting?: Object, message?: string, errorCode?: number, [key: string]: any }>}
 */
const createAutoMeetingService = async ({
  parentEntity,
  entityType,
  project,
  title,
  description,
  agenda,
  facilitatorId,
  meetingGroup,
  platform = MeetingPlatformTypes.GOOGLE_MEET,
  isMeetingPasswordRequired = false,
  scheduledAt,
  expectedDuration,
  createdBy,
  auditContext
}) => {
  try {
    const projectId = project._id;
    const entityId = parentEntity._id;
    const effectiveDescription = (description || agenda || "").trim() || undefined;
    const effectiveDuration = expectedDuration || getDefaultMeetingDurationMinutes();

    logWithTime(`[createAutoMeetingService] Starting automatic meeting creation for ${entityType} on platform ${platform}`);

    // ── 1. Assign and validate facilitator ──────────────────────────────
    const assignedFacilitatorId = facilitatorId || createdBy;

    if (assignedFacilitatorId !== createdBy) {
      logWithTime(`[createAutoMeetingService] Validating facilitator ${assignedFacilitatorId} is stakeholder`);

      const facilitatorStakeholder = await StakeholderModel.findOne({
        projectId,
        $or: [
          { userId: assignedFacilitatorId },
          { stakeholderId: assignedFacilitatorId }
        ],
        isDeleted: false
      }).lean();

      if (!facilitatorStakeholder) {
        logWithTime(`⛔ [createAutoMeetingService] Facilitator ${assignedFacilitatorId} is not a stakeholder of project ${projectId}`);
        return {
          success: false,
          message: "Facilitator is not a stakeholder of this project",
          errorCode: BAD_REQUEST
        };
      }
    }

    // ── 2. Validate allowParallelMeetings setting ──────────────────────
    if (parentEntity.allowParallelMeetings === false) {
      logWithTime("[createAutoMeetingService] allowParallelMeetings is FALSE - checking for active meetings...");

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

      if (existingMeetings.length > 0) {
        logWithTime(`⛔ [createAutoMeetingService] Parallel meetings disabled: Found ${existingMeetings.length} active meeting(s)`);
        const existingMeetingTitle = existingMeetings[0].title;
        return {
          success: false,
          message: `Cannot create meeting: Parallel meetings are disabled for this ${entityType} phase`,
          details: `Active meeting "${existingMeetingTitle}" exists. Complete or cancel it first.`,
          errorCode: CONFLICT
        };
      }
    }

    // ── 3. Generate meeting from provider official API ─────────────────
    // Provider calls are executed BEFORE persisting to MongoDB to prevent duplicate / dangling meetings on failure
    logWithTime(`[createAutoMeetingService] Generating provider meeting via official API for platform: ${platform}`);

    const providerResult = await generateMeetingFromProvider({
      platform,
      title: title.trim(),
      agenda: effectiveDescription,
      startTime: scheduledAt ? new Date(scheduledAt) : new Date(),
      durationMinutes: effectiveDuration,
      isMeetingPasswordRequired: Boolean(isMeetingPasswordRequired),
      requestId: auditContext?.requestId
    });

    if (!providerResult.success) {
      logWithTime(`⛔ [createAutoMeetingService] Provider meeting generation failed: ${providerResult.message}`);

      let errorCode = SERVICE_UNAVAILABLE;
      if (providerResult.isTimeout) {
        errorCode = GATEWAY_TIMEOUT;
      } else if (providerResult.isBadRequest) {
        errorCode = BAD_REQUEST;
      }

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

    logWithTime(`[createAutoMeetingService] ✓ Provider meeting generated. Link: ${meetingLink}, ProviderId: ${providerMeetingId}, Password: ${meetingPassword ? "[PRESENT]" : "[NONE]"}`);

    // ── 4. Create meeting document in MongoDB ───────────────────────────
    const meetingData = {
      entityId,
      projectId,
      entityType,
      title: title.trim(),
      description: effectiveDescription,
      facilitatorId: assignedFacilitatorId,
      meetingGroup: meetingGroup || undefined,
      platform: providerResult.platform || platform,
      status: scheduledAt ? MeetingStatuses.SCHEDULED : MeetingStatuses.DRAFT,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      expectedDuration: effectiveDuration,
      meetingLink,
      meetingPassword: meetingPassword || null,
      participants: [],
      createdBy
    };

    const meeting = new MeetingModel(meetingData);
    await meeting.save();

    logWithTime(`[createAutoMeetingService] ✅ Meeting saved to DB | ID: ${meeting._id}`);

    // ── 5. Add facilitator as first participant ────────────────────────
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
      logWithTime(`❌ [createAutoMeetingService] Failed to add facilitator as participant: ${addParticipantResult.message}`);
      await MeetingModel.findByIdAndDelete(meeting._id);
      return {
        success: false,
        message: "Failed to add facilitator as participant",
        errorCode: INTERNAL_ERROR
      };
    }

    const meetingWithParticipant = addParticipantResult.meeting;

    // ── 6. Update parent entity's meetingIds array ─────────────────────
    const ParentModel = PARENT_MODEL_MAP[entityType];
    await ParentModel.findByIdAndUpdate(
      entityId,
      { $push: { meetingIds: meetingWithParticipant._id } },
      { returnDocument: 'after' }
    );

    // ── 7. Version control service ─────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    await versionControlService(
      project,
      `Meeting automatically created: "${title}" (${platform})`,
      createdBy,
      { user, device, requestId }
    );

    // ── 8. Log activity tracker event ──────────────────────────────────
    logActivityTrackerEvent({
      user,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.CREATE_AUTO_MEETING,
      description: `Meeting automatically created: "${title}" in ${entityType} (Platform: ${platform}, Facilitator: ${assignedFacilitatorId})`,
      logOptions: {
        newData: { meeting: meetingWithParticipant.toObject() },
        userActions: { targetId: meeting._id.toString(), performedOn: DB_COLLECTIONS.MEETINGS }
      }
    });

    logWithTime(`✅ [createAutoMeetingService] Auto meeting creation complete: ${meetingWithParticipant._id}`);

    return {
      success: true,
      meeting: meetingWithParticipant.toObject(),
      passwordNote
    };

  } catch (error) {
    logWithTime(`❌ [createAutoMeetingService] Unexpected error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to automatically create meeting",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { createAutoMeetingService };
