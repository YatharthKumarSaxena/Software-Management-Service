// services/validations/update-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const { manualVersionControlService } = require("@services/common/version.service");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { Phases } = require("@configs/enums.config");

const updateValidationService = async ({
  projectId,
  allowParallelMeetings,
  updatedBy,
  auditContext,
}) => {
  try {
    // Check project exists
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return {
        success: false,
        message: "Project not found",
        errorCode: NOT_FOUND,
      };
    }

    // Check validation exists and is not deleted
    const validation = await ValidationModel.findOne({
      projectId,
      isDeleted: false,
    }).sort({ "version.major": -1, "version.minor": -1 });

    if (!validation) {
      return {
        success: false,
        message: "Validation not found",
        errorCode: NOT_FOUND,
      };
    }

    // ── 1. Check if any changes are being made ────────────────────────
    const allowParallelChanged = allowParallelMeetings !== undefined && validation.allowParallelMeetings !== allowParallelMeetings;

    if (!allowParallelChanged) {
      return {
        success: true,
        message: "No changes detected",
        validation,
      };
    }

    // ── 2. If toggling allowParallelMeetings from true to false, validate meetings ────────
    if (allowParallelChanged && validation.allowParallelMeetings === true && allowParallelMeetings === false) {
      const { MeetingModel } = require("@models/meeting.model");
      const { MeetingStatuses } = require("@configs/enums.config");

      // Check if there are any meetings
      if (validation.meetingIds && validation.meetingIds.length > 0) {
        // Fetch all meetings to check their status
        const meetings = await MeetingModel.find(
          { _id: { $in: validation.meetingIds }, isDeleted: false },
          { status: 1 }
        ).lean();

        // Check if any meeting is not COMPLETED or CANCELLED
        const ongoingMeetings = meetings.filter(m => 
          m.status !== MeetingStatuses.COMPLETED && m.status !== MeetingStatuses.CANCELLED
        );

        if (ongoingMeetings.length > 0) {
          return {
            success: false,
            message: "Cannot disable parallel meetings while there are ongoing/scheduled meetings. Please complete or cancel all meetings before disabling this option.",
            errorCode: CONFLICT,
          };
        }
      }
    }

    // ── 3. Update validation with allowParallelMeetings toggle ────────
    validation.allowParallelMeetings = allowParallelMeetings;
    validation.updatedBy = updatedBy;
    validation.updatedAt = new Date();

    await validation.save();

    // ── 4. Log activity ──────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_VALIDATION,
      `Validation updated - allowParallelMeetings toggled`,
      { adminActions: { targetId: projectId } }
    );

    // ── 5. Manual version control (increment minor version) ──────────────
    logWithTime(`[updateValidationService] Incrementing version for validation`);
    await manualVersionControlService({
      projectId,
      currentPhase: Phases.VALIDATION,
      action: `Validation updated - allowParallelMeetings toggled — version bump`,
      performedBy: updatedBy,
      auditContext
    });

    logWithTime(`✅ [updateValidationService] Validation updated with version control`);

    return {
      success: true,
      message: "Validation updated successfully",
      validation,
    };
  } catch (error) {
    console.error("[updateValidationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to update validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { updateValidationService };
