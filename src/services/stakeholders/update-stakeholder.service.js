// services/stakeholders/update-stakeholder.service.js

const { StakeholderModel } = require("@models/stakeholder.model");
const { versionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

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

    const oldStakeholder = stakeholder.toObject ? stakeholder.toObject() : { ...stakeholder };

    // ── Update ────────────────────────────────────────────────────────────────
    const updatedStakeholder = await StakeholderModel.findByIdAndUpdate(
      stakeholder._id,
      { $set: { role, updatedBy } },
      { returnDocument: 'after', runValidators: true }
    );

    // ── Version control ───────────────────────────────────────────────────────
    await versionControlService(
      project,
      `Stakeholder ${stakeholder.userId} role updated — version bump`,
      updatedBy,
      auditContext
    );

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldStakeholder, updatedStakeholder);
    logActivityTrackerEvent({
      user,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.UPDATE_STAKEHOLDER,
      description: `Stakeholder ${stakeholder.userId} role changed to "${role}" by ${updatedBy}`,
      logOptions: {
        oldData,
        newData,
        userActions: { performedOn: DB_COLLECTIONS.STAKEHOLDERS, targetId: stakeholder._id?.toString() },
      }
  });

    return { success: true, stakeholder: updatedStakeholder };

  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while updating stakeholder", error: error.message };
  }
};

module.exports = { updateStakeholderService };
