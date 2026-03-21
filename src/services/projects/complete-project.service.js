// services/projects/complete-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Marks a project as COMPLETED.
 *
 * Allowed source statuses : ACTIVE
 * Blocked if              : isDeleted === true  |  projectStatus === COMPLETED
 *
 * Sets projectStatus → COMPLETED and completedAt (the pre-save hook also
 * auto-sets completedAt, so it is doubly guaranteed).
 *
 * Version is NOT incremented – completing is a lifecycle event.
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.completedBy   - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const completeProjectService = async (project, params) => {
  try {

    // ── Guard: already completed ─────────────────────────────────────
    if (project.projectStatus === ProjectStatus.COMPLETED) {
      return { success: false, message: "Project is already completed" };
    }

    // ── Guard: must be ACTIVE to complete ────────────────────────────
    if (project.projectStatus !== ProjectStatus.ACTIVE) {
      return {
        success: false,
        message: "Only an ACTIVE project can be completed",
        currentStatus: project.projectStatus,
      };
    }

    const updatePayload = {
      projectStatus: ProjectStatus.COMPLETED,
      completedAt: new Date(),
      updatedBy: params.completedBy,
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
      ACTIVITY_TRACKER_EVENTS.COMPLETE_PROJECT,
      `Project '${updatedProject.name}' (${project._id}) marked as completed by ${params.completedBy}`,
      { oldData, newData, adminActions: { targetId: project._id } }
    );

    return { success: true, project: updatedProject };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while completing project", error: error.message };
  }
};

module.exports = { completeProjectService };
