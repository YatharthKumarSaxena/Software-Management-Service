// services/specifications/update-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const { manualVersionControlService } = require("@services/common/version.service");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { Phases } = require("@configs/enums.config");

const updateSpecificationService = async ({
  projectId,
  allowParallelMeetings,
  workflowMode,
  phaseStatus,
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

    // Check specification exists and is not deleted
    const specification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false,
    }).sort({ "version.major": -1, "version.minor": -1 });

    if (!specification) {
      return {
        success: false,
        message: "Specification not found",
        errorCode: NOT_FOUND,
      };
    }

    // ── 1. Check if any changes are being made ────────────────────────
    const allowParallelChanged = allowParallelMeetings !== undefined && specification.allowParallelMeetings !== allowParallelMeetings;
    const workflowModeChanged = workflowMode !== undefined && specification.workflowMode !== workflowMode;
    const phaseStatusChanged = phaseStatus !== undefined && specification.phaseStatus !== phaseStatus;

    if (!allowParallelChanged && !workflowModeChanged && !phaseStatusChanged) {
      return {
        success: true,
        message: "No changes detected",
        specification,
      };
    }

    // ── 2. If toggling allowParallelMeetings from true to false, validate meetings ────────
    if (allowParallelChanged && specification.allowParallelMeetings === true && allowParallelMeetings === false) {
      const { MeetingModel } = require("@models/meeting.model");
      const { MeetingStatuses } = require("@configs/enums.config");

      // Check if there are any meetings
      if (specification.meetingIds && specification.meetingIds.length > 0) {
        // Fetch all meetings to check their status
        const meetings = await MeetingModel.find(
          { _id: { $in: specification.meetingIds }, isDeleted: false },
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

    // ── 3. Update specification with allowParallelMeetings toggle ────────
    if (workflowModeChanged) {
      specification.workflowMode = workflowMode;
    }
    if (allowParallelChanged) {
      specification.allowParallelMeetings = allowParallelMeetings;
    }
    if (phaseStatusChanged) {
      specification.phaseStatus = phaseStatus;
    }
    specification.updatedBy = updatedBy;
    specification.updatedAt = new Date();

    await specification.save();

    let changeDesc = [];
    if (workflowModeChanged) changeDesc.push(`workflowMode: '${specification.workflowMode}' → '${workflowMode}'`);
    if (allowParallelChanged) changeDesc.push(`allowParallelMeetings: ${!allowParallelMeetings} → ${allowParallelMeetings}`);
    if (phaseStatusChanged) changeDesc.push(`phaseStatus: '${specification.phaseStatus}' → '${phaseStatus}'`);
    // ── 4. Log activity ──────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_SPECIFICATION,
      `Specification updated: ${changeDesc.join(', ')}`,
      { adminActions: { targetId: projectId } }
    );

    // ── 5. Manual version control (increment minor version) ──────────────
    logWithTime(`[updateSpecificationService] Incrementing version for specification`);
    await manualVersionControlService({
      projectId,
      currentPhase: Phases.SPECIFICATION,
      action: `Specification updated: ${changeDesc.join(', ')}`,
      performedBy: updatedBy,
      auditContext
    });

    logWithTime(`✅ [updateSpecificationService] Specification updated with version control`);

    return {
      success: true,
      message: "Specification updated successfully",
      specification,
    };
  } catch (error) {
    console.error("[updateSpecificationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to update specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { updateSpecificationService };
