// services/requirements/unassign-requirement.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, INTERNAL_ERROR, BAD_REQUEST } = require("@configs/http-status.config");
const { prepareAuditData } = require("@/utils/audit-data.util");
const { manualVersionControlService } = require("../common/version.service");
const { RequirementStatuses, Phases } = require("@/configs/enums.config");

/**
 * Unassign a requirement from a specific user.
 * Supports all three phases: Elicitation, Elaboration, Negotiation.
 * Phase is NOT frozen - accepts whatever phaseContext is specified.
 * Validates that the userId matches the current assignee before unassigning.
 */
const unassignRequirementService = async ({ requirementId, userId, project, elicitation, elaboration, negotiation, phase = null, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    if (requirement.status !== RequirementStatuses.DRAFT) {
      return { success: false, message: "Cannot unassign a requirement that is not in DRAFT status", errorCode: BAD_REQUEST };
    }

    // ── Validate userId matches current assignee ─────────────────────────
    if (!requirement.assigneeId) {
      return { success: false, message: "Requirement is not currently assigned to any user", errorCode: BAD_REQUEST };
    }

    if (requirement.assigneeId.toString() !== userId) {
      return { success: false, message: "Cannot unassign a different user from this requirement. Requirement is assigned to a different user.", errorCode: BAD_REQUEST };
    }

    // ── Determine active phases ──────────────────────────────────────────
    const activePhases = project.currentPhase;

    let assignedPhase = null;
    if (activePhases.length === 0) {
      return { success: false, message: "Project has no active phases", errorCode: CONFLICT };
    } else if (activePhases.length === 1) {
      assignedPhase = activePhases[0];
    } else {
      if (!phase) {
        return { success: false, message: "Multiple phases are active. Please specify which phase to unassign this requirement from.", errorCode: CONFLICT };
      }
      if (!activePhases.includes(phase)) {
        return { success: false, message: "Specified phase is not currently active for this project", errorCode: CONFLICT };
      }
      assignedPhase = phase;
    }

    const assignedPhaseContext = assignedPhase === Phases.ELICITATION ? elicitation : assignedPhase === Phases.ELABORATION ? elaboration : negotiation;

    if (!assignedPhaseContext) {
      return { success: false, message: "Phase context not found for the specified phase", errorCode: CONFLICT };
    }
    if (assignedPhaseContext.isFrozen) {
      return { success: false, message: "Cannot unassign requirement in a frozen phase", errorCode: CONFLICT };
    }

    const oldRequirement = requirement.toObject ? requirement.toObject() : { ...requirement };

    // ── Remove assignment ────────────────────────────────────────────────
    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      { $set: { assigneeId: null, updatedBy: auditContext?.user?.adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(oldRequirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_ASSIGNEE_UNASSIGNED,
      `Requirement "${updated.title}" unassigned from stakeholder ${oldRequirement.assigneeId}`,
      { ...auditData, adminActions: { targetId: updated._id.toString() } }
    );

    await manualVersionControlService({
      projectId: project._id,
      currentPhase: assignedPhase,
      action: `Requirement unassigned from stakeholder ${oldRequirement.assigneeId}`,
      performedBy: auditContext?.user?.adminId,
      auditContext
    });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [unassignRequirementService] Error: ${error.message}`);
    return { success: false, message: "Error unassigning requirement", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { unassignRequirementService };
