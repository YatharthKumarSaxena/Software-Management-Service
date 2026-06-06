// services/elaborations/update-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const { manualVersionControlService } = require("@services/common/version.service");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { Phases } = require("@configs/enums.config");

const updateElaborationService = async ({
  projectId,
  workflowMode,
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

    // Check elaboration exists and is not deleted
    const elaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false,
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!elaboration) {
      return {
        success: false,
        message: "Elaboration not found",
        errorCode: NOT_FOUND,
      };
    }

    // ── 1. Check if any changes are being made ────────────────────────
    const workflowModeChanged = workflowMode !== undefined && elaboration.workflowMode !== workflowMode;
    const allowParallelChanged = allowParallelMeetings !== undefined && elaboration.allowParallelMeetings !== allowParallelMeetings;

    if (!workflowModeChanged && !allowParallelChanged) {
      return {
        success: true,
        message: "No changes detected",
        elaboration,
      };
    }

    // ── 2. If toggling allowParallelMeetings from true to false, validate meetings ────────
    if (allowParallelChanged && elaboration.allowParallelMeetings === true && allowParallelMeetings === false) {
      const { MeetingModel } = require("@models/meeting.model");
      const { MeetingStatuses } = require("@configs/enums.config");

      // Check if there are any meetings
      if (elaboration.meetingIds && elaboration.meetingIds.length > 0) {
        // Fetch all meetings to check their status
        const meetings = await MeetingModel.find(
          { _id: { $in: elaboration.meetingIds }, isDeleted: false },
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

    // ── 3. Update elaboration with new values ────────────────────────
    if (workflowModeChanged) {
      elaboration.workflowMode = workflowMode;
    }
    if (allowParallelChanged) {
      elaboration.allowParallelMeetings = allowParallelMeetings;
    }
    elaboration.updatedBy = updatedBy;
    elaboration.updatedAt = new Date();

    await elaboration.save();

    // ── 4. Log activity ──────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    let changeDesc = [];
    if (workflowModeChanged) changeDesc.push(`workflowMode: '${elaboration.workflowMode}' → '${workflowMode}'`);
    if (allowParallelChanged) changeDesc.push(`allowParallelMeetings: ${!allowParallelMeetings} → ${allowParallelMeetings}`);
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_ELABORATION,
      `Elaboration updated: ${changeDesc.join(', ')}`,
      { adminActions: { targetId: projectId } }
    );

    // ── 5. Manual version control (increment minor version) ──────────────
    logWithTime(`[updateElaborationService] Incrementing version for elaboration`);
    await manualVersionControlService({
      projectId,
      currentPhase: Phases.ELABORATION,
      action: `Elaboration updated - allowParallelMeetings toggled — version bump`,
      performedBy: updatedBy,
      auditContext
    });

    logWithTime(`✅ [updateElaborationService] Elaboration updated with version control`);

    return {
      success: true,
      message: "Elaboration updated successfully",
      elaboration,
    };
  } catch (error) {
    console.error("[updateElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to update elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { updateElaborationService };
