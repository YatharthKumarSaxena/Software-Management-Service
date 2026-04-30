// services/requirements/unassign-collaborator.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, INTERNAL_ERROR, NOT_FOUND } = require("@configs/http-status.config");
const { prepareAuditData } = require("@/utils/audit-data.util");
const { Phases } = require("@/configs/enums.config");
const { manualVersionControlService } = require("../common/version.service");

/**
 * Unassign a collaborator from a requirement.
 * Removes the user from the collaborators array.
 */
const unassignContributorService = async ({ requirementId, userId, auditContext }) => {
  try {
    // ── Validate userId is provided ────────────────────────────────────────
    if (!userId) {
      return { success: false, message: "userId is required", errorCode: CONFLICT };
    }

    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    // ── Check if user is actually a collaborator ───────────────────────────
    if (!requirement.collaborators || !requirement.collaborators.includes(userId)) {
      return { success: false, message: "User is not a collaborator of this requirement", errorCode: CONFLICT };
    }

    const oldRequirement = requirement.toObject ? requirement.toObject() : { ...requirement };

    // ── Remove from collaborators array using $pull ─────────────────────────
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
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_ASSIGNEE_UNASSIGNED,
      `Stakeholder ${userId} removed as collaborator from requirement "${updated.title}"`,
      { ...auditData, adminActions: { targetId: updated._id.toString() } }
    );

    await manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Collaborator ${userId} unassigned from requirement`,
      performedBy: auditContext?.user?.adminId,
      auditContext
    });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [unassignContributorService] Error: ${error.message}`);
    return { success: false, message: "Error unassigning collaborator", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { unassignContributorService };
