// services/phases/delete-phase.service.js

const mongoose = require("mongoose");

const { ProjectModel } = require("@models/project.model");

const { Phases } = require("@configs/enums.config");

const {
  logActivityTrackerEvent
} = require("@services/audit/activity-tracker.service");

const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");

const deleteTrackerEventMap = {
    [Phases.INCEPTION]: ACTIVITY_TRACKER_EVENTS.DELETE_INCEPTION,
    [Phases.ELICITATION]: ACTIVITY_TRACKER_EVENTS.DELETE_ELICITATION,
    [Phases.ELABORATION]: ACTIVITY_TRACKER_EVENTS.DELETE_ELABORATION,
    [Phases.NEGOTIATION]: ACTIVITY_TRACKER_EVENTS.DELETE_NEGOTIATION,
    [Phases.SPECIFICATION]: ACTIVITY_TRACKER_EVENTS.DELETE_SPECIFICATION,
    [Phases.VALIDATION]: ACTIVITY_TRACKER_EVENTS.DELETE_VALIDATION
}

const {
  NOT_FOUND,
  CONFLICT,
  INTERNAL_ERROR,
  BAD_REQUEST
} = require("@configs/http-status.config");

const { logWithTime } = require("@utils/time-stamps.util");

const { isPhaseFrozen } = require("@utils/phase-status.util");

const deletePhaseService = async ({
  projectId,
  phaseType,
  deletionReasonType,
  deletionReasonDescription,
  deletedBy,
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

    const project = await ProjectModel.findById(projectId);

    if (!project) {
      return {
        success: false,
        message: "Project not found",
        errorCode: NOT_FOUND
      };
    }

    const Model = mongoose.model(phaseType);

    const latestPhase = await Model.findOne({
      projectId,
      isDeleted: false
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!latestPhase) {
      return {
        success: false,
        message: "Phase not found or already deleted",
        errorCode: NOT_FOUND
      };
    }

    if (isPhaseFrozen(latestPhase)) {
      return {
        success: false,
        message: "Frozen phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    if (latestPhase.version?.minor !== 0) {
      return {
        success: false,
        message: "Updated phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    latestPhase.isDeleted = true;
    latestPhase.deletedAt = new Date();
    latestPhase.deletedBy = deletedBy;
    latestPhase.deletionReasonType = deletionReasonType;
    latestPhase.deletionReasonDescription =
      deletionReasonDescription;

    await latestPhase.save();

    await ProjectModel.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          currentPhase: phaseType
        }
      }
    );

    const { user, device, requestId } =
      auditContext || {};

    const trackerEvent = deleteTrackerEventMap[phaseType];

    if (trackerEvent) {

      logActivityTrackerEvent(
        user,
        device,
        requestId,
        trackerEvent,
        `${phaseType} deleted - Reason: ${deletionReasonType}`,
        {
          adminActions: {
            targetId: projectId
          }
        }
      );
    }

    return {
      success: true,
      message: "Latest Cycle of " + phaseType + " phase deleted successfully",
      phase: latestPhase
    };

  } catch (error) {

    logWithTime(
      `❌ [deletePhaseService] ${error.message}`
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to delete phase",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = {
  deletePhaseService
};

