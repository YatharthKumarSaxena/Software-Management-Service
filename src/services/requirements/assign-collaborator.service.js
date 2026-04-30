// services/requirements/assign-collaborator.service.js

const { RequirementModel } = require("@models/requirement.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, INTERNAL_ERROR, NOT_FOUND, BAD_REQUEST } = require("@configs/http-status.config");
const { prepareAuditData } = require("@/utils/audit-data.util");
const { TotalTypes, Phases } = require("@/configs/enums.config");
const { manualVersionControlService } = require("../common/version.service");

/**
 * Assign a collaborator to a requirement.
 * Only admin stakeholders can be contributors.
 */
const assignContributorService = async ({ requirementId, userId, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    // ── Verify user is an admin stakeholder ────────────────────────────────
    const stakeholder = await StakeholderModel.findOne({
      userId: userId,
      projectId: requirement.projectId,
      isDeleted: false
    });

    if (!stakeholder) {
      return { success: false, message: "User is not a stakeholder of this project", errorCode: NOT_FOUND };
    }

    if (stakeholder.userType !== TotalTypes.ADMIN) {
      return { success: false, message: "Only admin stakeholders can be collaborators", errorCode: BAD_REQUEST };
    }

    // ── Check if already a collaborator ────────────────────────────────────
    if (requirement.collaborators && requirement.collaborators.includes(userId)) {
      return { success: true, message: "User is already a collaborator", requirement };
    }

    const oldRequirement = requirement.toObject ? requirement.toObject() : { ...requirement };

    // ── Add to collaborators array using $addToSet (prevents duplicates) ───
    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $addToSet: { collaborators: userId },
        $set: { updatedBy: auditContext?.user?.adminId }
      },
      { new: true }
    );

    const auditData = prepareAuditData(oldRequirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_ASSIGNEE_ASSIGNED,
      `Stakeholder ${userId} added as collaborator to requirement "${updated.title}"`,
      { ...auditData, adminActions: { targetId: updated._id.toString() } }
    );

    await manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Collaborator ${userId} assigned to requirement`,
      performedBy: auditContext?.user?.adminId,
       auditContext
    });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [assignCollaboratorService] Error: ${error.message}`);
    return { success: false, message: "Error assigning collaborator", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { assignContributorService };
