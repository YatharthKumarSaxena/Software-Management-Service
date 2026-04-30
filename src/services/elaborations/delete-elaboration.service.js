// services/elaborations/delete-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteElaborationService = async ({
  projectId,
  deletionReasonType,
  deletionReasonDescription,
  deletedBy,
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

    // Check elaboration exists and is not already deleted
    const elaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false // Ensure we only delete if not frozen
    });
    if (!elaboration) {
      return {
        success: false,
        message: "Elaboration not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (elaboration.version && elaboration.version.major !== 0) {
      return {
        success: false,
        message: "Cannot delete phase. Phase has been updated and cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete elaboration
    elaboration.isDeleted = true;
    elaboration.deletedAt = new Date();
    elaboration.deletedBy = deletedBy;
    elaboration.deletionReasonType = deletionReasonType;
    elaboration.deletionReasonDescription = deletionReasonDescription;

    await elaboration.save();

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
      elaboration,
    };
  } catch (error) {
    console.error("[deleteElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteElaborationService };
