// services/projects/activate-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Activates a project that was previously put DRAFT.
 *
 * Allowed source statuses : DRAFT
 * Blocked if              : isDeleted === true  |  projectStatus === COMPLETED
 *
 * Sets projectStatus → ACTIVE, records activationReasonType / activationReasonDescription,
 *
 * Version is NOT incremented – activating is a lifecycle event.
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.activationReasonType
 * @param {string} params.activationReasonDescription
 * @param {string} params.activatedBy         - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const activateProjectService = async (project, params) => {
  try {

    // ── Guard: must be DRAFT ────────────────────────────
    const activatableStatuses = [ProjectStatus.DRAFT];
    if (!activatableStatuses.includes(project.projectStatus)) {
      return {
        success: false,
        message: "Only a DRAFT project can be activated",
        currentStatus: project.projectStatus,
      };
    }

    const updatePayload = {
      projectStatus: ProjectStatus.ACTIVE,
      activationReasonType: params.activationReasonType,
      activationReasonDescription: params.activationReasonDescription || null,
      activatedBy: params.activatedBy,
      activatedAt: new Date()
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
      ACTIVITY_TRACKER_EVENTS.ACTIVATE_PROJECT,
      `Project '${updatedProject.name}' (${project._id}) activated by ${params.activatedBy}. Reason: ${params.activationReasonType}`,
      { oldData, newData, adminActions: { targetId: project._id } }
    );

    return { success: true, project: updatedProject };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while activating project", error: error.message };
  }
};

module.exports = { activateProjectService };
