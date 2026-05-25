// services/specifications/delete-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@/utils/time-stamps.util");

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
    const latestSpecification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!latestSpecification) {
      return {
        success: false,
        message: "Specification not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    if (latestSpecification.isFrozen) {
      return {
        success: false,
        message: "Frozen phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Check phase version - cannot delete if updated (version !== 0)
    if (latestSpecification.version?.minor !== 0) {
      return {
        success: false,
        message: "Updated phases cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // Soft delete specification
    latestSpecification.isDeleted = true;
    latestSpecification.deletedAt = new Date();
    latestSpecification.deletedBy = deletedBy;
    latestSpecification.deletionReasonType = deletionReasonType;
    latestSpecification.deletionReasonDescription = deletionReasonDescription;

    await latestSpecification.save();

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
      specification: latestSpecification,
    };
  } catch (error) {
    logWithTime(`❌ [deleteSpecificationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to delete specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteSpecificationService };
