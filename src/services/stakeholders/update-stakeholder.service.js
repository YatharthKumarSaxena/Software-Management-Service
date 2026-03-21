// services/stakeholders/update-stakeholder.service.js

const { StakeholderModel } = require("@models/stakeholder.model");
const { versionControlService } = require("@services/common/version.service");
const { convertOnHoldToActiveProjectService } = require("@services/projects/on-hold-project.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Updates the role of an existing (non-deleted) stakeholder.
 * Only `role` is updatable — no update reason is required.
 * Also runs version control on the project's current phase.
 *
 * @param {Object} stakeholder  - Mongoose stakeholder document (from req.stakeholder)
 * @param {Object} params
 * @param {string} params.role       - New role value (already validated by role-guard middleware)
 * @param {string} params.updatedBy  - USR-prefixed ID of the acting admin
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, stakeholder?: Object, message?: string }}
 */
const updateStakeholderService = async (stakeholder, project, { role, updatedBy, auditContext }) => {
  try {

    const blockedStatuses = [ProjectStatus.COMPLETED, ProjectStatus.ABORTED, ProjectStatus.ARCHIVED];
    if (blockedStatuses.includes(project.projectStatus)) {
      return {
        success: false,
        message: `Cannot update a stakeholder on a ${project.projectStatus} project`,
      };
    }

    // ── Auto-convert ON_HOLD → ACTIVE before proceeding ────────────────────────
    if (project.projectStatus === ProjectStatus.ON_HOLD) {
      const converted = await convertOnHoldToActiveProjectService(project, {
        convertedBy: updatedBy,
        auditContext,
      });
      if (!converted.success) {
        return { success: false, message: converted.message };
      }
    }

    const oldStakeholder = stakeholder.toObject ? stakeholder.toObject() : { ...stakeholder };

    // ── Update ────────────────────────────────────────────────────────────────
    const updatedStakeholder = await StakeholderModel.findByIdAndUpdate(
      stakeholder._id,
      { $set: { role, updatedBy } },
      { new: true, runValidators: true }
    );

    // ── Version control ───────────────────────────────────────────────────────
    await versionControlService(
      project,
      `Stakeholder ${stakeholder.stakeholderId} role updated — version bump`,
      updatedBy,
      auditContext
    );

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldStakeholder, updatedStakeholder);
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_STAKEHOLDER,
      `Stakeholder ${stakeholder.stakeholderId} role changed to "${role}" by ${updatedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: stakeholder._id?.toString() },
      }
    );

    return { success: true, stakeholder: updatedStakeholder };

  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while updating stakeholder", error: error.message };
  }
};

module.exports = { updateStakeholderService };
