// services/specifications/delete-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteSpecificationService = async ({
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

    // Check specification exists and is not already deleted
    const specification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false // Ensure we only delete if not frozen
    });
    if (!specification) {
      return {
        success: false,
        message: "Specification not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (specification.version && specification.version.major !== 0) {
      return {
        success: false,
        message: "Cannot delete phase. Phase has been updated and cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete specification
    specification.isDeleted = true;
    specification.deletedAt = new Date();
    specification.deletedBy = deletedBy;
    specification.deletionReasonType = deletionReasonType;
    specification.deletionReasonDescription = deletionReasonDescription;

    await specification.save();

    // Remove phase from project currentPhase array
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { currentPhase: Phases.SPECIFICATION } },
      { new: true }
    );

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_SPECIFICATION,
      `Specification deleted - Reason: ${deletionReasonType}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Specification deleted successfully",
      specification,
    };
  } catch (error) {
    console.error("[deleteSpecificationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteSpecificationService };
