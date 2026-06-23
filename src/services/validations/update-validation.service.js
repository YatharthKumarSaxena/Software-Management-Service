// services/validations/update-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const { executePhaseUpdate } = require("@services/common/phase-update.service");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { Phases } = require("@configs/enums.config");

const updateValidationService = async ({
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
    const workflowModeChanged = workflowMode !== undefined && validation.workflowMode !== workflowMode;
    const phaseStatusChanged = phaseStatus !== undefined && validation.phaseStatus !== phaseStatus;

    const documentChanged = allowParallelChanged || workflowModeChanged;

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

    const changeDesc = [];
    if (workflowModeChanged) changeDesc.push(`workflowMode: '${validation.workflowMode}' → '${workflowMode}'`);
    if (allowParallelChanged) changeDesc.push(`allowParallelMeetings: ${validation.allowParallelMeetings} → ${allowParallelMeetings}`);

    const result = await executePhaseUpdate({
      phaseDocument: validation,
      phase: Phases.VALIDATION,
      phaseName: "Validation",
      requestedPhaseStatus: phaseStatus,
      phaseStatusChanged,
      documentChanged,
      updatedBy,
      auditContext,
      versionAction: "Validation update — version bump",
      updateDocument: async currentValidation => {
        if (workflowModeChanged) currentValidation.workflowMode = workflowMode;
        if (allowParallelChanged) currentValidation.allowParallelMeetings = allowParallelMeetings;
        currentValidation.updatedBy = updatedBy;
        currentValidation.updatedAt = new Date();
        await currentValidation.save();
        const { user, device, requestId } = auditContext || {};
        logActivityTrackerEvent(user, device, requestId, ACTIVITY_TRACKER_EVENTS.UPDATE_VALIDATION,
          `Validation updated: ${changeDesc.join(', ')}`,
          { adminActions: { targetId: projectId } });
        return currentValidation;
      }
    });

    return { ...result, validation: result.phaseDocument };
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
