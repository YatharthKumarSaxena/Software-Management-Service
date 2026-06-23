// services/negotiations/update-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const { executePhaseUpdate } = require("@services/common/phase-update.service");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { Phases } = require("@configs/enums.config");

const updateNegotiationService = async ({
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

    // Check negotiation exists and is not deleted
    const negotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false,
    }).sort({ "version.major": -1, "version.minor": -1 });

    if (!negotiation) {
      return {
        success: false,
        message: "Negotiation not found",
        errorCode: NOT_FOUND,
      };
    }

    // ── 1. Check if any changes are being made ────────────────────────
    const workflowModeChanged = workflowMode !== undefined && negotiation.workflowMode !== workflowMode;
    const allowParallelChanged = allowParallelMeetings !== undefined && negotiation.allowParallelMeetings !== allowParallelMeetings;
    const phaseStatusChanged = phaseStatus !== undefined && negotiation.phaseStatus !== phaseStatus;

    const documentChanged = workflowModeChanged || allowParallelChanged;

    // ── 2. If toggling allowParallelMeetings from true to false, validate meetings ────────
    if (allowParallelChanged && negotiation.allowParallelMeetings === true && allowParallelMeetings === false) {
      const { MeetingModel } = require("@models/meeting.model");
      const { MeetingStatuses } = require("@configs/enums.config");

      // Check if there are any meetings
      if (negotiation.meetingIds && negotiation.meetingIds.length > 0) {
        // Fetch all meetings to check their status
        const meetings = await MeetingModel.find(
          { _id: { $in: negotiation.meetingIds }, isDeleted: false },
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
    if (workflowModeChanged) changeDesc.push(`workflowMode: '${negotiation.workflowMode}' → '${workflowMode}'`);
    if (allowParallelChanged) changeDesc.push(`allowParallelMeetings: ${negotiation.allowParallelMeetings} → ${allowParallelMeetings}`);

    const result = await executePhaseUpdate({
      phaseDocument: negotiation,
      phase: Phases.NEGOTIATION,
      phaseName: "Negotiation",
      requestedPhaseStatus: phaseStatus,
      phaseStatusChanged,
      documentChanged,
      updatedBy,
      auditContext,
      versionAction: "Negotiation update — version bump",
      updateDocument: async currentNegotiation => {
        if (workflowModeChanged) currentNegotiation.workflowMode = workflowMode;
        if (allowParallelChanged) currentNegotiation.allowParallelMeetings = allowParallelMeetings;
        currentNegotiation.updatedBy = updatedBy;
        currentNegotiation.updatedAt = new Date();
        await currentNegotiation.save();
        const { user, device, requestId } = auditContext || {};
        logActivityTrackerEvent(user, device, requestId, ACTIVITY_TRACKER_EVENTS.UPDATE_NEGOTIATION,
          `Negotiation updated: ${changeDesc.join(', ')}`,
          { adminActions: { targetId: projectId } });
        return currentNegotiation;
      }
    });

    return { ...result, negotiation: result.phaseDocument };
  } catch (error) {
    console.error("[updateNegotiationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to update negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { updateNegotiationService };
