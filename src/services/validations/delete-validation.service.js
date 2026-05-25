// services/validations/delete-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@/utils/time-stamps.util");

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
    const latestValidation = await ValidationModel.findOne({
      projectId,
      isDeleted: false
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!latestValidation) {
      return {
        success: false,
        message: "Validation not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    if (latestValidation.isFrozen) {
      return {
        success: false,
        message: "Frozen phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (latestValidation.version?.minor !== 0) {
      return {
        success: false,
        message: "Updated phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete validation
    latestValidation.isDeleted = true;
    latestValidation.deletedAt = new Date();
    latestValidation.deletedBy = deletedBy;
    latestValidation.deletionReasonType = deletionReasonType;
    latestValidation.deletionReasonDescription = deletionReasonDescription;

    await latestValidation.save();

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
      validation: latestValidation,
    };
  } catch (error) {
    logWithTime(`❌ [deleteValidationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to delete validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteValidationService };
