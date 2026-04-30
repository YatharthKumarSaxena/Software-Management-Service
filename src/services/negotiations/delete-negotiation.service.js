// services/negotiations/delete-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteNegotiationService = async ({
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

    // Check negotiation exists and is not already deleted
    const negotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false // Ensure we only delete if not frozen
    });
    if (!negotiation) {
      return {
        success: false,
        message: "Negotiation not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (negotiation.version && negotiation.version.major !== 0) {
      return {
        success: false,
        message: "Cannot delete phase. Phase has been updated and cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete negotiation
    negotiation.isDeleted = true;
    negotiation.deletedAt = new Date();
    negotiation.deletedBy = deletedBy;
    negotiation.deletionReasonType = deletionReasonType;
    negotiation.deletionReasonDescription = deletionReasonDescription;

    await negotiation.save();

    // Remove phase from project currentPhase array
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { currentPhase: Phases.NEGOTIATION } },
      { new: true }
    );

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_NEGOTIATION,
      `Negotiation deleted - Reason: ${deletionReasonType}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Negotiation deleted successfully",
      negotiation,
    };
  } catch (error) {
    console.error("[deleteNegotiationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteNegotiationService };
