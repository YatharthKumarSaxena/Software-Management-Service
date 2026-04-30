// services/requirements/assign-requirement.service.js

const { RequirementModel } = require("@models/requirement.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, INTERNAL_ERROR, NOT_FOUND, BAD_REQUEST } = require("@configs/http-status.config");
const { prepareAuditData } = require("@/utils/audit-data.util");
const { manualVersionControlService } = require("../common/version.service");
const { TotalTypes, Phases, RequirementStatuses } = require("@/configs/enums.config");

/**
 * Assign a requirement to an admin stakeholder.
 * Only admin stakeholders can be assigned.
 * Supports all three phases: Elicitation, Elaboration, Negotiation.
 * Phase is NOT frozen - accepts whatever phaseContext is specified.
 */
const assignRequirementService = async ({ requirementId, userId, project, elicitation, elaboration, negotiation, phase = null, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    if (requirement.status !== RequirementStatuses.DRAFT) {
      return { success: false, message: "Cannot assign a requirement that is not in DRAFT status", errorCode: BAD_REQUEST };
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
        return { success: false, message: "Multiple phases are active. Please specify which phase to assign this requirement to.", errorCode: CONFLICT };
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
      return { success: false, message: "Cannot assign requirement in a frozen phase", errorCode: CONFLICT };
    }

    // ── Verify user is an admin stakeholder ────────────────────────────────
    const stakeholder = await StakeholderModel.findOne({
      userId: userId,
      projectId: requirement.projectId,
      isDeleted: false
    });

    if (!stakeholder) {
      return { success: false, message: "User is not a stakeholder of this project", errorCode: CONFLICT };
    }

    if (stakeholder.userType !== TotalTypes.ADMIN) {
      return { success: false, message: "Only admin stakeholders can be assigned requirements", errorCode: CONFLICT };
    }

    // ── Check if already assigned to same user ────────────────────────────
    if (requirement.assigneeId === userId) {
      return { success: true, message: "Requirement is already assigned to this user", requirement };
    }

    const oldRequirement = requirement.toObject ? requirement.toObject() : { ...requirement };

    // ── Update assignment ────────────────────────────────────────────────
    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      { $set: { assigneeId: userId, updatedBy: auditContext?.user?.adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(oldRequirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_ASSIGNED,
      `Requirement "${updated.title}" assigned to stakeholder ${userId}`,
      { ...auditData, adminActions: { targetId: updated._id.toString() } }
    );

    // ── Call version control if phase specified ────────────────────────────
      await manualVersionControlService({
        projectId: project._id,
        currentPhase: assignedPhase,
        action: `Requirement assigned to stakeholder ${userId}`,
        performedBy: auditContext?.user?.adminId,
        auditContext
      });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [assignRequirementService] Error: ${error.message}`);
    return { success: false, message: "Error assigning requirement", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { assignRequirementService };
