// services/elaborations/delete-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@/utils/time-stamps.util");
const { isPhaseFrozen } = require("@utils/phase-status.util");

const deleteElaborationService = async ({
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

    // Check elaboration exists and is not already deleted
    const latestElaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!latestElaboration) {
      return {
        success: false,
        message: "Elaboration not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    if (isPhaseFrozen(latestElaboration)) {
      return {
        success: false,
        message: "Frozen phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (latestElaboration.version?.minor !== 0) {
      return {
        success: false,
        message: "Updated phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete elaboration
    latestElaboration.isDeleted = true;
    latestElaboration.deletedAt = new Date();
    latestElaboration.deletedBy = deletedBy;
    latestElaboration.deletionReasonType = deletionReasonType;
    latestElaboration.deletionReasonDescription = deletionReasonDescription;

    await latestElaboration.save();

    // Remove phase from project currentPhase array
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { currentPhase: Phases.ELABORATION } },
      { new: true }
    );

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_ELABORATION,
      `Elaboration deleted - Reason: ${deletionReasonType}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Elaboration deleted successfully",
      elaboration: latestElaboration,
    };
  } catch (error) {
    logWithTime(`❌ [deleteElaborationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to delete elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteElaborationService };
