// services/projects/delete-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Soft-deletes a project (sets isDeleted = true).
 *
 * Delete can happen ONLY ONCE — blocked if isDeleted is already true.
 * Also blocked if projectStatus === COMPLETED (nothing can be done after completion).
 *
 * After deletion, no further operations (update / abort / complete / resume)
 * are permitted on the project.
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.deletionReasonType
 * @param {string} [params.deletionReasonDescription]
 * @param {string} params.deletedBy         - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true } | { success: false, message, error? }}
 */
const deleteProjectService = async (project, params) => {
  try {

    // ── Guard: ACTIVE projects cannot be deleted ────────────────
    if (project.projectStatus === ProjectStatus.ACTIVE) {
      return { success: false, message: "Project is currently active" };
    }

    // ── Guard: COMPLETED projects cannot be deleted ──────────────
    if (project.projectStatus === ProjectStatus.COMPLETED) {
      return { success: false, message: "Completed projects cannot be deleted" };
    }

    // ARCHIVED projects CAN be deleted

    const updatePayload = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: params.deletedBy,
      deletionReasonType: params.deletionReasonType,
      deletionReasonDescription: params.deletionReasonDescription || null,
    };

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      project._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ──────────────────────────
    const { user, device, requestId } = params.auditContext || {};
    const { oldData, newData } = prepareAuditData(project, updatedProject);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_PROJECT,
      `Project '${project.name}' (${project._id}) soft-deleted by ${params.deletedBy}. Reason: ${params.deletionReasonType}`,
      { oldData, newData, adminActions: { targetId: project._id } }
    );

    return { success: true };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while deleting project", error: error.message };
  }
};

module.exports = { deleteProjectService };
