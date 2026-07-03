// services/stakeholders/delete-stakeholder.service.js

const { StakeholderModel } = require("@models/stakeholder.model");
const { versionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectCategoryTypes } = require("@configs/enums.config");
const { errorMessage } = require("@/utils/log-error.util");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

/**
 * Soft-deletes a stakeholder and runs version control on the project's current phase.
 * Deletion reason is REQUIRED (enforced by presence middleware).
 *
 * @param {Object} stakeholder  - Mongoose stakeholder document (from req.stakeholder)
 * @param {Object} params
 * @param {string} params.deletedBy
 * @param {string} params.deletionReasonType
 * @param {string|null} params.deletionReasonDescription
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, message?: string }}
 */
const deleteStakeholderService = async (
  stakeholder, project,
  { deletedBy, deletionReasonType, deletionReasonDescription, auditContext }
) => {
  try {

    if (project && project.projectCategory === ProjectCategoryTypes.INDIVIDUAL) {
      return {
        success: false,
        message: "Stakeholders cannot be removed from an individual project",
      };
    }

    const oldStakeholder = stakeholder.toObject ? stakeholder.toObject() : { ...stakeholder };

    // ── Soft-delete ───────────────────────────────────────────────────────────
    const updatedStakeholder = await StakeholderModel.findByIdAndUpdate(
      stakeholder._id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
          deletionReasonType,
          deletionReasonDescription: deletionReasonDescription || null,
        },
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedStakeholder) {
      return { success: false, message: "Stakeholder not found or already deleted" };
    }

    // ── Version control (reuses the project already fetched above) ───────────
    if (project && !project.isDeleted) {
      await versionControlService(
        project,
        `Stakeholder ${stakeholder.userId} removed from project — version bump`,
        deletedBy,
        auditContext
      );
    }

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldStakeholder, updatedStakeholder);
    logActivityTrackerEvent({
      user,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.DELETE_STAKEHOLDER,
      description: `Stakeholder ${stakeholder.userId} deleted from project ${stakeholder.projectId} by ${deletedBy}. Reason: ${deletionReasonType}`,
      logOptions: {
        oldData,
        newData,
        userActions: {
          targetId: stakeholder._id?.toString(),
          performedOn: DB_COLLECTIONS.STAKEHOLDERS,
          reason:  deletionReasonType,
        },
      }
  });

    return { success: true };

  } catch (error) {
    errorMessage(error);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while deleting stakeholder", error: error.message };
  }
};

module.exports = { deleteStakeholderService };
