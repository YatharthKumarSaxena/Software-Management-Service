// services/requirements/requirement-state-transitions.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, INTERNAL_ERROR, BAD_REQUEST, FORBIDDEN } = require("@configs/http-status.config");
const { RequirementStatuses, WorkflowModes, Phases } = require("@configs/enums.config");
const { prepareAuditData } = require("@/utils/audit-data.util");
const { manualVersionControlService } = require("../common/version.service");
const { isPhaseFrozen } = require("@utils/phase-status.util");

/**
 * Issue a requirement (flag for discussion).
 * Allowed in Elicitation and Elaboration phases.
 * If phase workflow mode is MODERATION: UNDER_REVIEW is compulsory.
 * If phase workflow mode is OPEN: Both DRAFT and UNDER_REVIEW allowed.
 */
const issueRequirementService = async ({ requirementId, project, elicitation, elaboration, negotiation, reasonType, reasonDescription, phase, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    const validFromStatuses = [RequirementStatuses.DRAFT, RequirementStatuses.UNDER_REVIEW];
    if (!validFromStatuses.includes(requirement.status)) {
      return { success: false, message: `Can only mark DRAFT or UNDER_REVIEW requirements as issued. Current: ${requirement.status}`, errorCode: BAD_REQUEST };
    }

    // ── Determine assigned phase ─────────────────────────────────────────
    const activePhases = project.currentPhase;
    let phaseContext = null;

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

    // ── Get phase context ────────────────────────────────────────────────
    if (assignedPhase === Phases.ELICITATION) {
      phaseContext = elicitation;
    } else if (assignedPhase === Phases.ELABORATION) {
      phaseContext = elaboration;
    } else if (assignedPhase === Phases.NEGOTIATION) {
      phaseContext = negotiation;
    }

    if (!phaseContext) {
      return { success: false, message: `Phase context not found for phase: ${assignedPhase}`, errorCode: CONFLICT };
    }

    // ── Validate workflow mode and status ────────────────────────────────
    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      // MODERATION mode: UNDER_REVIEW is compulsory
      if (requirement.status !== RequirementStatuses.UNDER_REVIEW) {
        return { success: false, message: `In Moderation mode for ${assignedPhase}, only UNDER_REVIEW requirements can be marked as issued. Current: ${requirement.status}`, errorCode: BAD_REQUEST };
      }

      // Check if user is an approver
      if (!phaseContext.approvers.includes(auditContext?.user?.adminId)) {
        return { success: false, message: `User is not an approver for this ${assignedPhase}`, errorCode: FORBIDDEN };
      }
    }
    // OPEN mode: Both DRAFT and UNDER_REVIEW allowed (no additional validation)

    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $set: {
          status: RequirementStatuses.ISSUED,
          decision: {
            reasonType,
            reasonDescription,
            decidedBy: auditContext?.user?.adminId,
            decidedAt: new Date()
          },
          updatedBy: auditContext?.user?.adminId
        }
      },
      { new: true }
    );

    const auditData = prepareAuditData(requirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_ISSUED,
      `Requirement marked as issued: "${updated.title}" - Reason: ${reasonType}`,
      { ...auditData, adminActions: { targetId: requirement._id.toString() } }
    );

    await manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: assignedPhase,
      action: `Requirement marked as issued in ${assignedPhase} phase`,
      performedBy: auditContext?.user?.adminId,
      auditContext
    });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [issueRequirementService] Error: ${error.message}`);
    return { success: false, message: "Error marking requirement as issued", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Accept a requirement.
 * Only allowed in Elaboration and Negotiation phases (not in Elicitation).
 */
const acceptRequirementService = async ({ requirementId, project, elaboration, negotiation, phase = null, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    const validFromStatuses = [RequirementStatuses.DRAFT, RequirementStatuses.UNDER_REVIEW, RequirementStatuses.ISSUED];
    if (!validFromStatuses.includes(requirement.status)) {
      return { success: false, message: `Can only accept DRAFT, UNDER_REVIEW, or ISSUED requirements. Current: ${requirement.status}`, errorCode: CONFLICT };
    }

    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      if (requirement.status !== RequirementStatuses.UNDER_REVIEW) {
        return { success: false, message: `In Moderation mode, only UNDER_REVIEW requirements can be accepted. Current: ${requirement.status}`, errorCode: BAD_REQUEST };
      }
    }

    // ── Determine active phases ─────────────────────────────────────────────
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

    // ── Check phase restriction: Only Elaboration and Negotiation allowed ────
    if (assignedPhase !== Phases.ELABORATION && assignedPhase !== Phases.NEGOTIATION) {
      return { success: false, message: `Accept decision can only be made in Elaboration and Negotiation phases, not in ${assignedPhase}`, errorCode: FORBIDDEN };
    }

    // ── Validate approvers for assigned phase ──────────────────────────────
    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      // Use ternary to get phase context
      const phaseContextMap = {
        [Phases.ELABORATION]: elaboration,
        [Phases.NEGOTIATION]: negotiation
      };
      const phaseContext = phaseContextMap[assignedPhase];

      // Check if phase context exists
      if (!phaseContext) {
        return { success: false, message: `Phase context not found for ${assignedPhase}`, errorCode: CONFLICT };
      }

      // Check if user is an approver for this phase
      if (!phaseContext.approvers.includes(auditContext?.user?.adminId)) {
        return { success: false, message: `User is not an approver for ${assignedPhase} phase`, errorCode: FORBIDDEN };
      }
    }
    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $set: {
          status: RequirementStatuses.ACCEPTED,
          decision: {
            decidedBy: auditContext?.user?.adminId,
            decidedAt: new Date()
          },
          updatedBy: auditContext?.user?.adminId
        }
      },
      { new: true }
    );

    const auditData = prepareAuditData(requirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_ACCEPTED,
      `Requirement accepted: "${updated.title}"`,
      { ...auditData, adminActions: { targetId: requirement._id.toString() } }
    );

      manualVersionControlService({
        projectId: requirement.projectId,
        currentPhase: assignedPhase,
        action: `Requirement accepted: "${updated.title}"`,
        performedBy: auditContext?.user?.adminId,
        auditContext
      });


    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [acceptRequirementService] Error: ${error.message}`);
    return { success: false, message: "Error accepting requirement", errorCode: INTERNAL_ERROR };
  }
};

const deferRequirementService = async ({ requirementId, negotiation, reasonType, reasonDescription, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    const validFromStatuses = [RequirementStatuses.DRAFT, RequirementStatuses.UNDER_REVIEW, RequirementStatuses.ISSUED, RequirementStatuses.ACCEPTED];
    if (!validFromStatuses.includes(requirement.status)) {
      return { success: false, message: `Can only defer DRAFT, UNDER_REVIEW, ISSUED, or ACCEPTED requirements. Current: ${requirement.status}`, errorCode: CONFLICT };
    }

    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      if (requirement.status !== RequirementStatuses.UNDER_REVIEW) {
        return { success: false, message: `In Moderation mode, only UNDER_REVIEW requirements can be deferred. Current: ${requirement.status}`, errorCode: BAD_REQUEST };
      }
      if (negotiation?.approvers && !negotiation.approvers.includes(auditContext?.user?.adminId)) {
        return { success: false, message: "User is not an approver for negotiation phase", errorCode: FORBIDDEN };
      }
    }

    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $set: {
          status: RequirementStatuses.DEFERRED,
          decision: {
            reasonType,
            reasonDescription,
            decidedBy: auditContext?.user?.adminId,
            decidedAt: new Date()
          },
          updatedBy: auditContext?.user?.adminId
        }
      },
      { new: true }
    );

    const auditData = prepareAuditData(requirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_DEFERRED,
      `Requirement deferred: "${updated.title}" - Reason: ${reasonType}`,
      { ...auditData, adminActions: { targetId: requirement._id.toString() } }
    );

    await manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: Phases.NEGOTIATION,
      action: `Requirement deferred in Negotiation phase - Reason: ${reasonType}`,
      performedBy: auditContext?.user?.adminId,
      auditContext
    });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [deferRequirementService] Error: ${error.message}`);
    return { success: false, message: "Error deferring requirement", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Reject a requirement.
 * - Elicitation: Can reject DRAFT directly (no review needed)
 * - Elaboration & Negotiation: Must be UNDER_REVIEW
 */
const rejectRequirementService = async ({ requirementId, project, elicitation, elaboration, negotiation, reasonType, reasonDescription, phase = null, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    const validFromStatuses = [RequirementStatuses.DRAFT, RequirementStatuses.UNDER_REVIEW, RequirementStatuses.ISSUED];
    if (!validFromStatuses.includes(requirement.status)) {
      return { success: false, message: `Can only reject DRAFT, UNDER_REVIEW, or ISSUED requirements. Current: ${requirement.status}`, errorCode: CONFLICT };
    }

    // ── Determine active phases ─────────────────────────────────────────────
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

    // ── Phase-specific status validation ────────────────────────────────────
    // In Elicitation: Can reject DRAFT directly (no review requirement)
    // In Elaboration & Negotiation: Must be UNDER_REVIEW (review is compulsory)
    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      if (assignedPhase === Phases.ELICITATION) {
        // Elicitation: Allow DRAFT to REJECTED directly
        // No additional check needed
      } else if (assignedPhase === Phases.ELABORATION || assignedPhase === Phases.NEGOTIATION) {
        // Elaboration & Negotiation: Must be UNDER_REVIEW
        if (requirement.status !== RequirementStatuses.UNDER_REVIEW) {
          return { success: false, message: `In ${assignedPhase} phase with Moderation mode, only UNDER_REVIEW requirements can be rejected. Current: ${requirement.status}`, errorCode: BAD_REQUEST };
        }
      }
    }

    // ── Validate approvers for assigned phase ──────────────────────────────
    if (requirement.createdInMode === WorkflowModes.MODERATION && assignedPhase) {
      // Use ternary to get phase context
      const phaseContextMap = {
        [Phases.ELICITATION]: elicitation,
        [Phases.ELABORATION]: elaboration,
        [Phases.NEGOTIATION]: negotiation
      };
      const phaseContext = phaseContextMap[assignedPhase];

      // Check if phase context exists
      if (!phaseContext) {
        return { success: false, message: `Phase context not found for ${assignedPhase}`, errorCode: CONFLICT };
      }

      // Check if user is an approver for this phase
      if (!phaseContext.approvers.includes(auditContext?.user?.adminId)) {
        return { success: false, message: `User is not an approver for ${assignedPhase} phase`, errorCode: FORBIDDEN };
      }
    }

    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $set: {
          status: RequirementStatuses.REJECTED,
          decision: {
            reasonType,
            reasonDescription,
            decidedBy: auditContext?.user?.adminId,
            decidedAt: new Date()
          },
          updatedBy: auditContext?.user?.adminId
        }
      },
      { new: true }
    );

    const auditData = prepareAuditData(requirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_REJECTED,
      `Requirement rejected: "${updated.title}" - Reason: ${reasonType}`,
      { ...auditData, adminActions: { targetId: requirement._id.toString() } }
    );

      manualVersionControlService({
        projectId: requirement.projectId,
        currentPhase: assignedPhase,
        action: `Requirement rejected: "${updated.title}" - Reason: ${reasonType}`,
        performedBy: auditContext?.user?.adminId,
        auditContext
      });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [rejectRequirementService] Error: ${error.message}`);
    return { success: false, message: "Error rejecting requirement", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Revert requirement to DRAFT.
 * Allowed in all three statuses: DRAFT, UNDER_REVIEW, ISSUED.
 * Allowed in all three phases: Elicitation, Elaboration, Negotiation.
 * Phase must exist (not frozen).
 * Only approvers can revert if createdInMode is MODERATION.
 */
const revertToDraftService = async ({ requirementId, project, elicitation, elaboration, negotiation, phase = null, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    // ── Validate allowed statuses ────────────────────────────────────────
    const validFromStatuses = [ RequirementStatuses.UNDER_REVIEW, RequirementStatuses.ISSUED];
    if (!validFromStatuses.includes(requirement.status)) {
      return { success: false, message: `Can only revert UNDER_REVIEW, or ISSUED requirements to DRAFT. Current: ${requirement.status}`, errorCode: CONFLICT };
    }

    // ── Determine assigned phase ─────────────────────────────────────────
    const activePhases = project.currentPhase;

    let assignedPhase = null;
    if (activePhases.length === 0) {
      return { success: false, message: "Project has no active phases", errorCode: CONFLICT };
    } else if (activePhases.length === 1) {
      assignedPhase = activePhases[0];
    } else {
      // Multiple phases - require explicit specification
      if (!phase) {
        return { success: false, message: "Multiple phases are active. Please specify which phase to revert this requirement from.", errorCode: CONFLICT };
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
      return { success: false, message: "Cannot revert requirement in a frozen phase", errorCode: CONFLICT };
    }

    // ── Validate approvers if MODERATION mode ────────────────────────────
    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      if (!phaseContext.reviewers.includes(auditContext?.user?.adminId)) {
        return { success: false, message: `User is not an approver for ${assignedPhase} phase`, errorCode: FORBIDDEN };
      }

      // ── Validate at least one non-deleted review note exists in MODERATION mode
      const nonDeletedReviewNotes = requirement.reviewNotes.filter(note => !note.isDeleted);
      if (nonDeletedReviewNotes.length === 0) {
        logWithTime(`❌ [revertToDraftService] Cannot revert - no non-deleted review notes in MODERATION mode`);
        return {
          success: false,
          message: "Cannot revert requirement to DRAFT in moderation mode without at least one review note",
          errorCode: CONFLICT
        };
      }
    }

    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      { $set: { status: RequirementStatuses.DRAFT, updatedBy: auditContext?.user?.adminId }, $unset: { decision: 1 } },
      { new: true }
    );

    const auditData = prepareAuditData(requirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_REVERTED_TO_DRAFT,
      `Requirement reverted to DRAFT: "${updated.title}"`,
      { ...auditData, adminActions: { targetId: requirement._id.toString() } }
    );

    await manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: assignedPhase,
      action: `Requirement reverted to DRAFT in ${assignedPhase} phase`,
      performedBy: auditContext?.user?.adminId,
      auditContext
    });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [revertToDraftService] Error: ${error.message}`);
    return { success: false, message: "Error reverting requirement", errorCode: INTERNAL_ERROR };
  }
};

const revokeRequirementService = async ({ requirementId, project, elaboration, negotiation, reasonType, reasonDescription, phase = null, auditContext }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    const validFromStatuses = [RequirementStatuses.ISSUED, RequirementStatuses.ACCEPTED];
    if (!validFromStatuses.includes(requirement.status)) {
      return { success: false, message: `Can only revoke ISSUED or ACCEPTED requirements. Current: ${requirement.status}`, errorCode: CONFLICT };
    }

    // ── Determine active phases ─────────────────────────────────────────────
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

    // ── Validate approvers for assigned phase ──────────────────────────────
    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      // Use ternary to get phase context
      const phaseContextMap = {
        [Phases.ELABORATION]: elaboration,
        [Phases.NEGOTIATION]: negotiation
      };
      const phaseContext = phaseContextMap[assignedPhase];

      // Check if phase context exists
      if (!phaseContext) {
        return { success: false, message: `Phase context not found for ${assignedPhase}`, errorCode: CONFLICT };
      }

      // Check if user is an approver for this phase
      if (!phaseContext.approvers.includes(auditContext?.user?.adminId)) {
        return { success: false, message: `User is not an approver for ${assignedPhase} phase`, errorCode: FORBIDDEN };
      }
    }

    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $set: {
          status: RequirementStatuses.REVOKED,
          decision: {
            reasonType,
            reasonDescription,
            decidedBy: auditContext?.user?.adminId,
            decidedAt: new Date()
          },
          updatedBy: auditContext?.user?.adminId
        }
      },
      { new: true }
    );

    const auditData = prepareAuditData(requirement, updated);

    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_REVOKED,
      `Requirement revoked: "${updated.title}" - Reason: ${reasonType}`,
      { ...auditData, adminActions: { targetId: requirement._id.toString() } }
    );

      await manualVersionControlService({
        projectId: requirement.projectId,
        currentPhase: assignedPhase,
        action: `Requirement revoked: "${updated.title}" - Reason: ${reasonType}`,
        performedBy: auditContext?.user?.adminId,
        auditContext
      });

    return { success: true, requirement: updated };
  } catch (error) {
    logWithTime(`❌ [revokeRequirementService] Error: ${error.message}`);
    return { success: false, message: "Error revoking requirement", errorCode: INTERNAL_ERROR };
  }
};

module.exports = {
  issueRequirementService,
  acceptRequirementService,
  rejectRequirementService,
  revertToDraftService,
  deferRequirementService,
  revokeRequirementService
};
