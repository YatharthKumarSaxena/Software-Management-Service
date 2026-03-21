// services/projects/abort-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Aborts an project project.
 *
 * Allowed source statuses : DRAFT | ACTIVE | ON_HOLD
 * Blocked if              : isDeleted === true  |  projectStatus === COMPLETED  |  projectStatus === ABORTED
 *
 * Sets projectStatus → ABORTED, records abortReasonType / abortReasonDescription,
 * stamps abortedAt (also handled by the pre-save hook as a fallback), and
 * records who performed the action.
 *
 * Version is NOT incremented – abort is a lifecycle event, not a content change.
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.abortReasonType
 * @param {string} [params.abortReasonDescription]
 * @param {string} params.abortedBy         - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */

const abortProjectService = async (project, params) => {
  try {

    // ── Guard: terminal statuses ─────────────────────────────────────
    if (project.projectStatus === ProjectStatus.COMPLETED) {
      return { success: false, message: "Project is already completed" };
    }
    if (project.projectStatus === ProjectStatus.ABORTED) {
      return { success: false, message: "Project is already aborted" };
    }

    // ── Build update payload ─────────────────────────────────────────
    const updatePayload = {
      projectStatus: ProjectStatus.ABORTED,
      abortReasonType: params.abortReasonType,
      abortReasonDescription: params.abortReasonDescription || null,
      abortedAt: new Date(),
      updatedBy: params.abortedBy,
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
      ACTIVITY_TRACKER_EVENTS.ABORT_PROJECT,
      `Project '${updatedProject.name}' (${project._id}) aborted by ${params.abortedBy}. Reason: ${params.abortReasonType}`,
      { oldData, newData, adminActions: { targetId: project._id } }
    );

    return { success: true, project: updatedProject };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while aborting project", error: error.message };
  }
};

module.exports = { abortProjectService };
