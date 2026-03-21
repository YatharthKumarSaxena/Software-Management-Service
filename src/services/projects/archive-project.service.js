// services/projects/archive-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Archives a COMPLETED project.
 *
 * Allowed source status : COMPLETED only
 * Blocked if            : isDeleted === true  |  isArchived === true  |  status !== COMPLETED
 *
 * Sets projectStatus → ARCHIVED, stamps archivedAt / archivedBy.
 * An ARCHIVED project can later be soft-deleted (delete-project service allows it).
 *
 * Version is NOT incremented – archiving is a lifecycle event.
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {boolean} project.isArchived
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.archivedBy    - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const archiveProjectService = async (project, params) => {
  try {
    
    // ── Guard: already archived ──────────────────────────────────────
    if (project.isArchived) {
      return { success: false, message: "Project is already archived" };
    }

    // ── Guard: only COMPLETED and ABORTED projects can be archived ───────────────
    if (project.projectStatus !== ProjectStatus.COMPLETED && project.projectStatus !== ProjectStatus.ABORTED) {
      return {
        success: false,
        message: "Only a COMPLETED or ABORTED project can be archived",
        currentStatus: project.projectStatus,
      };
    }

    const updatePayload = {
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: params.archivedBy,
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
      ACTIVITY_TRACKER_EVENTS.ARCHIVE_PROJECT,
      `Project '${updatedProject.name}' (${project._id}) archived by ${params.archivedBy}`,
      { oldData, newData, adminActions: { targetId: project._id } }
    );

    return { success: true, project: updatedProject };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while archiving project", error: error.message };
  }
};

module.exports = { archiveProjectService };
