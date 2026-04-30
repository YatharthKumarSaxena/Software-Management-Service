// services/validations/delete-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteValidationService = async ({
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

    // Check validation exists and is not already deleted
    const validation = await ValidationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false // Ensure we only delete if not frozen
    });
    if (!validation) {
      return {
        success: false,
        message: "Validation not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (validation.version && validation.version.major !== 0) {
      return {
        success: false,
        message: "Cannot delete phase. Phase has been updated and cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete validation
    validation.isDeleted = true;
    validation.deletedAt = new Date();
    validation.deletedBy = deletedBy;
    validation.deletionReasonType = deletionReasonType;
    validation.deletionReasonDescription = deletionReasonDescription;

    await validation.save();

    // Remove phase from project currentPhase array
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { currentPhase: Phases.VALIDATION } },
      { new: true }
    );

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_VALIDATION,
      `Validation deleted - Reason: ${deletionReasonType}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Validation deleted successfully",
      validation,
    };
  } catch (error) {
    console.error("[deleteValidationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteValidationService };
