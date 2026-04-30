// services/requirements/remove-collaborator.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, INTERNAL_ERROR, NOT_FOUND } = require("@configs/http-status.config");
const { prepareAuditData } = require("@/utils/audit-data.util");

/**
 * Remove a collaborator from a requirement.
 */
const removeCollaboratorService = async ({ requirementId, userId, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });
    if (!requirement) {
      return { success: false, message: "Requirement not found", errorCode: NOT_FOUND };
    }

    // ── Check if user is a collaborator ───────────────────────────────────
    if (!requirement.collaborators || !requirement.collaborators.includes(userId)) {
      return { success: true, message: "User is not a collaborator on this requirement", requirement };
    }

    const oldRequirement = requirement.toObject ? requirement.toObject() : { ...requirement };

    // ── Remove from collaborators array using $pull ────────────────────────
    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $pull: { collaborators: userId },
        $set: { updatedBy: auditContext?.user?.adminId }
      },
      { new: true }
    );

    const auditData = prepareAuditData(oldRequirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_COLLABORATOR_REMOVED,
      `Stakeholder ${userId} removed as collaborator from requirement "${updated.title}"`,
      { ...auditData, adminActions: { targetId: updated._id.toString() } }
    );

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [removeCollaboratorService] Error: ${error.message}`);
    return { success: false, message: "Error removing collaborator", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { removeCollaboratorService };
