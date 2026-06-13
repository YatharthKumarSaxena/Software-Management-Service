// services/elicitations/delete-elicitation.service.js

const { ProjectModel } = require("../../models");
const { ElicitationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@/utils/time-stamps.util");
const { isPhaseFrozen } = require("@utils/phase-status.util");

const deleteElicitationService = async ({
  projectId,
  deletionReasonType,
  deletionReasonDescription,
  deletedBy,
  auditContext
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

    // Check elicitation exists and is not already deleted
    const latestElicitation = await ElicitationModel.findOne({
      projectId,
      isDeleted: false
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!latestElicitation) {
      return {
        success: false,
        message: "Elicitation not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    if (isPhaseFrozen(latestElicitation)) {
      return {
        success: false,
        message: "Frozen phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (latestElicitation.version?.minor !== 0) {
      return {
        success: false,
        message: "Updated phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete elicitation
    latestElicitation.isDeleted = true;
    latestElicitation.deletedAt = new Date();
    latestElicitation.deletedBy = deletedBy;
    latestElicitation.deletionReasonType = deletionReasonType;
    latestElicitation.deletionReasonDescription = deletionReasonDescription;

    await latestElicitation.save();

    // Remove phase from project currentPhase array
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { currentPhase: Phases.ELICITATION } },
      { new: true }
    );

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_ELICITATION,
      `Elicitation deleted - Reason: ${deletionReasonType}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Elicitation deleted successfully",
      elicitation: latestElicitation,
    };
  } catch (error) {
    logWithTime(`❌ [deleteElicitationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to delete elicitation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteElicitationService };
