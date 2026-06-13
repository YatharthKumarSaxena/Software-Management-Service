// services/requirements/update-requirement-status.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { RequirementStatuses, Phases, WorkflowModes } = require("@configs/enums.config");
const { prepareAuditData } = require("@/utils/audit-data.util");
const { manualVersionControlService } = require("../common/version.service");
const { isPhaseFrozen } = require("@utils/phase-status.util");

/**
 * Update requirement status.
 * Validates status transitions and calls version control service.
 * Supports all three phases: Elicitation, Elaboration, Negotiation.
 */
const startReviewRequirementService = async ({ requirementId, project, phase = null, elicitation, elaboration, negotiation, updatedBy, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    if (requirement.status !== RequirementStatuses.DRAFT) {
      return { success: false, message: `Only requirements in DRAFT status can be moved to UNDER_REVIEW. Current status: ${requirement.status}`, errorCode: CONFLICT };
    }

    const activePhases = project.currentPhase;

    let assignedPhase = null;
    if (activePhases.length === 0) {
      return { success: false, message: "Project has no active phases", errorCode: CONFLICT };
    } else if (activePhases.length === 1) {
      assignedPhase = activePhases[0];
    } else {
      // Multiple phases - require explicit specification
      if (!phase) {
        return { success: false, message: "Multiple phases are active. Please specify which phase to assign this requirement to.", errorCode: CONFLICT };
      }
      if (!activePhases.includes(phase)) {
        return { success: false, message: "Specified phase is not currently active for this project", errorCode: CONFLICT };
      }
      assignedPhase = phase;
    }

    // ── Get phase context using phaseContextMap ──────────────────────────
    const phaseContextMap = {
      [Phases.ELICITATION]: elicitation,
      [Phases.ELABORATION]: elaboration,
      [Phases.NEGOTIATION]: negotiation
    };
    const phaseContext = phaseContextMap[assignedPhase];

    // ── Check if phase context exists ────────────────────────────────────
    if (!phaseContext) {
      return { success: false, message: `Phase context not found for ${assignedPhase}`, errorCode: CONFLICT };
    }

    if (isPhaseFrozen(phaseContext)) {
      return { success: false, message: "Cannot start review for requirement in a frozen phase", errorCode: CONFLICT };
    }

    // ── Validate contributors if MODERATION mode ────────────────────────
    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      if (!phaseContext.contributors.includes(updatedBy)) {
        return { success: false, message: `User is not a contributor for ${assignedPhase}`, errorCode: CONFLICT };
      }
    }

    const oldRequirement = requirement.toObject ? requirement.toObject() : { ...requirement };

    // ── Update status ────────────────────────────────────────────────────
    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      { $set: { status: RequirementStatuses.UNDER_REVIEW, updatedBy: auditContext?.user?.adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(oldRequirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_TRANSITIONED_TO_REVIEW,
      `Requirement "${updated.title}" status updated from ${oldRequirement.status} to ${RequirementStatuses.UNDER_REVIEW}`,
      { ...auditData, adminActions: { targetId: updated._id.toString() } }
    );

    // ── Call version control with target phase ────────────────────────────
    await manualVersionControlService({
      projectId: project._id,
      currentPhase: assignedPhase,
      action: "Requirement moved to review",
      performedBy: auditContext?.user?.adminId,
      auditContext
    });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [startReviewRequirementService] Error: ${error.message}`);
    return { success: false, message: "Error starting review for requirement", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { startReviewRequirementService };
