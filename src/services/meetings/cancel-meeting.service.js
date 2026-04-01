// services/meetings/cancel-meeting.service.js

const { MeetingModel } = require("@models/meeting.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { NegotiationModel } = require("@models/negotiation.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { SpecificationModel } = require("@models/specification.model");
const { ValidationModel } = require("@models/validation.model");
const { InceptionModel } = require("@models/inception.model");
const { MeetingStatuses, PriorityLevels } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { versionControlService } = require("@services/common/version.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");

// ── Model mapping for entity types ─────────────────────────────────────
const MODEL_MAP = {
  [DB_COLLECTIONS.ELICITATIONS]: ElicitationModel,
  [DB_COLLECTIONS.NEGOTIATIONS]: NegotiationModel,
  [DB_COLLECTIONS.ELABORATIONS]: ElaborationModel,
  [DB_COLLECTIONS.INCEPTIONS]: InceptionModel,
  [DB_COLLECTIONS.SPECIFICATIONS]: SpecificationModel,
  [DB_COLLECTIONS.VALIDATIONS]: ValidationModel
};

/**
 * Cancels a meeting (soft delete by setting status to CANCELLED).
 * Only allowed if status is DRAFT.
 *
 * @param {Object} meeting - Meeting document (already validated by middleware)
 * @param {Object} params
 * @param {string} [params.cancelReason] - Reason for cancellation (optional)
 * @param {string} [params.cancelDescription] - Detailed description (optional)
 * @param {string} params.cancelledBy - User ID who cancelled
 * @param {Object} params.auditContext - { user, device, requestId }
 *
 * @returns {{ success: true, meeting } | { success: false, message }}
 */
const cancelMeetingService = async (
  meeting, project,
  { cancelReason, cancelDescription, cancelledBy, auditContext }
) => {
  try {
    // ── 1. Consistency rule: If cancelDescription exists, cancelReason must exist ──
    if (cancelDescription && !cancelReason) {
      logWithTime(
        `⛔ [cancelMeetingService] cancelDescription provided without cancelReason`
      );
      return {
        success: false,
        message: "cancelReason is required when cancelDescription is provided",
        errorCode: BAD_REQUEST
      };
    }

    if (project.projectCriticality === PriorityLevels.CRITICAL) {
      if (!cancelReason) {
        return {
          success: false,
          message: "cancelReason is required for Critical Projects",
          errorCode: BAD_REQUEST
        }
      }
    }

    if (meeting.status !== MeetingStatuses.SCHEDULED && meeting.status !== MeetingStatuses.DRAFT) {
      logWithTime(
        `⛔ [cancelMeetingService] Meeting status is ${meeting.status}, expected SCHEDULED or DRAFT`
      );
      return {
        success: false,
        message: `Meeting cannot be cancelled. Current status: ${meeting.status}. Only DRAFT or SCHEDULED meetings can be cancelled.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── 2. Build update payload ────────────────────────────────────────
    const updatePayload = {
      status: MeetingStatuses.CANCELLED,
      cancelledAt: new Date(),
      cancelledBy,
      updatedBy: cancelledBy,
      updatedAt: new Date()
    };

    if (cancelReason !== undefined) {
      updatePayload.cancelReason = cancelReason;
    }

    if (cancelDescription !== undefined) {
      updatePayload.cancelDescription = cancelDescription;
    }

    // ── 3. Cancel via atomic findByIdAndUpdate ─────────────────────────
    const cancelledMeeting = await MeetingModel.findByIdAndUpdate(
      meeting._id,
      { $set: updatePayload },
      { new: true }
    );

    // ── 4. Get project for version control ────────────────────────────
    const ParentModel = MODEL_MAP[meeting.entityType];

    // ── 5. Call version control service to update elicitation minor version
    const { user, device, requestId } = auditContext || {};
    await versionControlService(
      project,
      `Meeting cancelled: "${meeting.title}"`,
      cancelledBy,
      { user, device, requestId }
    );

    // ── 6. Log activity tracker event ──────────────────────────────────
    const { oldData, newData } = prepareAuditData(meeting, cancelledMeeting);

    let reason = cancelReason || "No reason provided";
    if (cancelDescription) reason += ` - ${cancelDescription}`;

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CANCEL_MEETING,
      `Meeting cancelled: "${meeting.title}". Reason: ${reason}`,
      { oldData, newData }
    );

    logWithTime(
      `✅ [cancelMeetingService] Meeting cancelled: ${meeting._id}`
    );

    return {
      success: true,
      meeting: cancelledMeeting
    };

  } catch (error) {
    logWithTime(`❌ [cancelMeetingService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { cancelMeetingService };
