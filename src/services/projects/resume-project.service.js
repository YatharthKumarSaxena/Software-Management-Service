// services/projects/resume-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Resumes a project that was previously put ON_HOLD or ABORTED.
 *
 * Allowed source statuses : ON_HOLD | ABORTED
 * Blocked if              : isDeleted === true  |  projectStatus === COMPLETED
 *
 * Sets projectStatus → ACTIVE, records resumeReasonType / resumeReasonDescription,
 * and clears abortedAt (since the project is now active again).
 *
 * Version is NOT incremented – resuming is a lifecycle event.
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.resumeReasonType
 * @param {string} [params.resumeReasonDescription]
 * @param {string} params.resumedBy         - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const resumeProjectService = async (project, params) => {
  try {

    // ── Guard: completed projects cannot be resumed ──────────────────
    if (project.projectStatus === ProjectStatus.COMPLETED) {
      return { success: false, message: "Project is already completed" };
    }

    // ── Guard: must be ON_HOLD  ────────────────────────────
    const resumableStatuses = [ProjectStatus.ON_HOLD];
    if (!resumableStatuses.includes(project.projectStatus)) {
      return {
        success: false,
        message: "Only an ON_HOLD project can be resumed",
        currentStatus: project.projectStatus,
      };
    }

    const updatePayload = {
      projectStatus: ProjectStatus.ACTIVE,
      resumeReasonType: params.resumeReasonType,
      resumeReasonDescription: params.resumeReasonDescription || null,
      updatedBy: params.resumedBy,
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
      ACTIVITY_TRACKER_EVENTS.RESUME_PROJECT,
      `Project '${updatedProject.name}' (${project._id}) resumed by ${params.resumedBy}. Reason: ${params.resumeReasonType}`,
      { oldData, newData, adminActions: { targetId: project._id } }
    );

    return { success: true, project: updatedProject };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while resuming project", error: error.message };
  }
};

module.exports = { resumeProjectService };
