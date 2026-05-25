// services/negotiations/delete-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@/utils/time-stamps.util");

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
    const latestNegotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!latestNegotiation) {
      return {
        success: false,
        message: "Negotiation not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    if (latestNegotiation.isFrozen) {
      return {
        success: false,
        message: "Frozen phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (latestNegotiation.version?.minor !== 0) {
      return {
        success: false,
        message: "Updated phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete negotiation
    latestNegotiation.isDeleted = true;
    latestNegotiation.deletedAt = new Date();
    latestNegotiation.deletedBy = deletedBy;
    latestNegotiation.deletionReasonType = deletionReasonType;
    latestNegotiation.deletionReasonDescription = deletionReasonDescription;

    await latestNegotiation.save();

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
      negotiation: latestNegotiation,
    };
  } catch (error) {
    logWithTime(`❌ [deleteNegotiationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to delete negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteNegotiationService };
