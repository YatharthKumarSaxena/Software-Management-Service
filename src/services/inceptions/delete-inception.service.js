// services/inceptions/delete-inception.service.js

const { InceptionModel } = require("@models/inception.model");
const { ProjectTypes, ProjectStatus, PriorityLevels } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");

/**
 * Soft-deletes an inception (sets isDeleted = true).
 *
 * Guards:
 *   1. Prevents deletion if the project type is DEVELOPMENT
 *   2. Project must be in ACTIVE or DRAFT status (checked via middleware)
 *
 * @param {Object} inception
 * @param {string} inception._id
 * @param {string} inception.projectId
 * @param {Object} params
 * @param {string} params.deletedBy - Admin USR ID
 * @param {string} params.deletionReasonType - Enum reason for deletion
 * @param {string} [params.deletionReasonDescription] - Optional description
 * @param {Object} [params.auditContext] - For activity tracking
 *
 * @returns {{ success: true } | { success: false, message }}
 */
const deleteInceptionService = async (inception, params) => {
  try {
    const { project, deletedBy, deletionReasonType, deletionReasonDescription, auditContext } = params;
    
    if (project.projectStatus !== ProjectStatus.ACTIVE && project.projectStatus !== ProjectStatus.DRAFT) {
      return {
        success: false,
        message: "Inception cannot be deleted for projects that are not in ACTIVE or DRAFT status."
      };
    }

    // ── Guard 1: Check if project type is DEVELOPMENT ──────────────────────────
    if (project.projectType === ProjectTypes.DEVELOPMENT) {
      return {
        success: false,
        message: "Inception cannot be deleted for Project Development type."
      };
    }

    if (project.projectCriticality === PriorityLevels.CRITICAL && !deletionReasonDescription) {
      return {
        success: false,
        message: "Inception cannot be deleted for high-criticality projects without a reason description."
      };
    }

    // ── Soft-delete the inception ────────────────────────────────────────────
    const updatePayload = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
      deletionReasonType,
      deletionReasonDescription: deletionReasonDescription || null
    };

    const updatedInception = await InceptionModel.findByIdAndUpdate(
      inception._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ───────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(inception, updatedInception);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_INCEPTION,
      `Inception (${inception._id}) soft-deleted by ${deletedBy}. Reason: ${deletionReasonType}`,
      { oldData, newData, adminActions: { targetId: inception._id } }
    );

    return { success: true };
  } catch (error) {
    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        error: error.message
      };
    }
    return {
      success: false,
      message: "Internal error while deleting inception",
      error: error.message
    };
  }
};

module.exports = { deleteInceptionService };
