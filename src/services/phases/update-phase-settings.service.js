const mongoose = require("mongoose");

const { ProjectModel } = require("@models/project.model");

const {
  MeetingStatuses,
  Phases
} = require("@configs/enums.config");

const {
  NOT_FOUND,
  CONFLICT,
  BAD_REQUEST,
  INTERNAL_ERROR
} = require("@configs/http-status.config");

const {
  manualVersionControlService
} = require("@services/common/version.service");

const {
  logActivityTrackerEvent
} = require("@services/audit/activity-tracker.service");

const {
  ACTIVITY_TRACKER_EVENTS
} = require("@configs/tracker.config");

const updateTrackerMap = {
  [Phases.INCEPTION]: ACTIVITY_TRACKER_EVENTS.UPDATE_INCEPTION,
  [Phases.ELICITATION]: ACTIVITY_TRACKER_EVENTS.UPDATE_ELICITATION,
  [Phases.ELABORATION]: ACTIVITY_TRACKER_EVENTS.UPDATE_ELABORATION,
  [Phases.NEGOTIATION]: ACTIVITY_TRACKER_EVENTS.UPDATE_NEGOTIATION,
  [Phases.SPECIFICATION]: ACTIVITY_TRACKER_EVENTS.UPDATE_SPECIFICATION,
  [Phases.VALIDATION]: ACTIVITY_TRACKER_EVENTS.UPDATE_VALIDATION
};

const updatePhaseSettingsService = async ({
  projectId,
  phaseType,
  workflowMode,
  allowParallelMeetings,
  updatedBy,
  auditContext
}) => {

  try {

    if (!Object.values(Phases).includes(phaseType)) {
      return {
        success: false,
        message: "Invalid phase type",
        errorCode: BAD_REQUEST
      };
    }

    const project =
      await ProjectModel.findById(projectId);

    if (!project) {
      return {
        success: false,
        message: "Project not found",
        errorCode: NOT_FOUND
      };
    }

    const Model = mongoose.model(phaseType);

    const phase =
      await Model.findOne({
        projectId,
        isDeleted: false
      }).sort({
        "version.major": -1,
        "version.minor": -1
      });

    if (!phase) {
      return {
        success: false,
        message: "Phase not found",
        errorCode: NOT_FOUND
      };
    }

    const workflowModeChanged =
      workflowMode !== undefined &&
      phase.workflowMode !== workflowMode;

    const allowParallelChanged =
      allowParallelMeetings !== undefined &&
      phase.allowParallelMeetings !== allowParallelMeetings;

    if (
      allowParallelChanged &&
      phase.allowParallelMeetings === true &&
      allowParallelMeetings === false
    ) {

      const MeetingModel =
        mongoose.model("meetings");

      const meetings =
        await MeetingModel.find({
          _id: { $in: phase.meetingIds },
          isDeleted: false
        }).lean();

      const ongoingMeetings =
        meetings.filter(
          meeting =>
            meeting.status !==
              MeetingStatuses.COMPLETED &&
            meeting.status !==
              MeetingStatuses.CANCELLED
        );

      if (ongoingMeetings.length > 0) {
        return {
          success: false,
          message:
            "Cannot disable parallel meetings while active meetings exist.",
          errorCode: CONFLICT
        };
      }
    }

    if (
      !workflowModeChanged &&
      !allowParallelChanged
    ) {
      return {
        success: true,
        message: "No changes detected",
        phase
      };
    }

    if (workflowModeChanged) {
      phase.workflowMode = workflowMode;
    }

    if (allowParallelChanged) {
      phase.allowParallelMeetings =
        allowParallelMeetings;
    }

    phase.updatedBy = updatedBy;

    await phase.save();

    const versionResult =
      await manualVersionControlService({
        projectId,
        currentPhase: phaseType,
        action: `${phaseType} settings update`,
        performedBy: updatedBy,
        auditContext,
        phaseDocument: phase
      });

    if (!versionResult.success) {
      return versionResult;
    }

    const trackerEvent =
      updateTrackerMap[phaseType];

    const { user, device, requestId } =
      auditContext || {};

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      trackerEvent,
      `${phaseType} settings updated`,
      {
        adminActions: {
          targetId: projectId
        }
      }
    );

    return {
      success: true,
      message:
        "Settings of Latest " + phaseType + " Phase updated successfully",
      phase: versionResult.phaseDocument
    };

  } catch (error) {

    return {
      success: false,
      message: error.message,
      errorCode: INTERNAL_ERROR
    };

  }
};

module.exports = {
  updatePhaseSettingsService
};