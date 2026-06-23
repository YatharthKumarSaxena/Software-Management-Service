// services/elaborations/update-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const { executePhaseUpdate } = require("@services/common/phase-update.service");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { Phases } = require("@configs/enums.config");

const updateElaborationService = async ({
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
    const phaseStatusChanged = phaseStatus !== undefined && elaboration.phaseStatus !== phaseStatus;

    const documentChanged = workflowModeChanged || allowParallelChanged;

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

    const changeDesc = [];
    if (workflowModeChanged) changeDesc.push(`workflowMode: '${elaboration.workflowMode}' → '${workflowMode}'`);
    if (allowParallelChanged) changeDesc.push(`allowParallelMeetings: ${elaboration.allowParallelMeetings} → ${allowParallelMeetings}`);

    const result = await executePhaseUpdate({
      phaseDocument: elaboration,
      phase: Phases.ELABORATION,
      phaseName: "Elaboration",
      requestedPhaseStatus: phaseStatus,
      phaseStatusChanged,
      documentChanged,
      updatedBy,
      auditContext,
      versionAction: "Elaboration update — version bump",
      updateDocument: async currentElaboration => {
        if (workflowModeChanged) currentElaboration.workflowMode = workflowMode;
        if (allowParallelChanged) currentElaboration.allowParallelMeetings = allowParallelMeetings;
        currentElaboration.updatedBy = updatedBy;
        currentElaboration.updatedAt = new Date();
        await currentElaboration.save();
        const { user, device, requestId } = auditContext || {};
        logActivityTrackerEvent(user, device, requestId, ACTIVITY_TRACKER_EVENTS.UPDATE_ELABORATION,
          `Elaboration updated: ${changeDesc.join(', ')}`,
          { adminActions: { targetId: projectId } });
        return currentElaboration;
      }
    });

    return { ...result, elaboration: result.phaseDocument };
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
