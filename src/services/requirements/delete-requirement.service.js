// services/requirements/delete-requirement.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR, FORBIDDEN, CONFLICT } = require("@configs/http-status.config");
const { UserTypes, WorkflowModes, RequirementStatuses, Phases } = require("@configs/enums.config");
const { ActivityTrackerModel } = require("@/models");
const { manualVersionControlService } = require("../common/version.service");

/**
 * Soft-deletes a requirement (only allowed in Elicitation and Elaboration phases).
 * Cannot delete requirements that are in ISSUED status.
 *
 * @param {Object} params
 * @param {string} params.requirementId       - Requirement MongoDB ObjectId
 * @param {Object} params.project             - Project object with currentPhase array
 * @param {string} [params.phase]             - Specific phase when multiple are active
 * @param {Object} [params.elicitation]       - Elicitation object for access check
 * @param {Object} [params.elaboration]       - Elaboration object for access check
 * @param {string} params.deletedBy           - Admin ID who deleted it
 * @param {string} [params.userType]          - User type for access check (CLIENT, ADMIN, etc.)
 * @param {string} [params.deletionReasonType] - Reason type for deletion
 * @param {string} [params.deletionReasonDescription] - Detailed reason for deletion
 * @param {Object} params.auditContext        - { user, device, requestId }
 *
 * @returns {{ success: true, requirement } | { success: false, message, errorCode }}
 */
const deleteRequirementService = async ({
  requirementId,
  project,
  phase,
  elicitation,
  elaboration,
  deletionReasonType,
  deletionReasonDescription,
  deletedBy,
  userType,
  auditContext
}) => {
  try {
    // Fetch current requirement
    const currentRequirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    // Check if client trying to delete admin-modified requirement
    if (userType === UserTypes.CLIENT && currentRequirement.isAdminModified) {
      logWithTime(`❌ [deleteRequirementService] Access denied. Client ${deletedBy} cannot delete requirement that was modified by admin`);
      return { success: false, message: "This requirement has been modified by an admin and can no longer be deleted by clients", errorCode: FORBIDDEN };
    }

    // Determine active phase - same logic as create and update services
    const activePhases = project.currentPhase;
    let assignedPhase = null;

    if (activePhases.length === 0) {
      return { success: false, message: "Project has no active phases", errorCode: CONFLICT };
    } else if (activePhases.length === 1) {
      assignedPhase = activePhases[0];
    } else {
      // Multiple phases - require explicit specification
      if (!phase) {
        return { success: false, message: "Multiple phases are active. Please specify which phase.", errorCode: CONFLICT };
      }
      if (!activePhases.includes(phase)) {
        return { success: false, message: "Specified phase is not currently active for this project", errorCode: CONFLICT };
      }
      assignedPhase = phase;
    }

    // Check if delete is allowed only in Elicitation and Elaboration phases
    if (assignedPhase !== Phases.ELICITATION && assignedPhase !== Phases.ELABORATION) {
      logWithTime(`❌ [deleteRequirementService] Delete not allowed in ${assignedPhase} phase`);
      return { success: false, message: `Requirements can only be deleted in Elicitation and Elaboration phases, not in ${assignedPhase}`, errorCode: FORBIDDEN };
    }

    // Check if requirement is in DRAFT status - cannot delete non-draft requirements
    if (currentRequirement.status !== RequirementStatuses.DRAFT) {
      logWithTime(`❌ [deleteRequirementService] Cannot delete requirement in ${currentRequirement.status} status: ${requirementId}`);
      return { success: false, message: "Cannot delete requirements that are not in DRAFT status", errorCode: CONFLICT };
    }

    // Get the active phase context object
    let activePhaseContext = null;
    if (assignedPhase === Phases.ELICITATION) {
      activePhaseContext = elicitation;
    } else if (assignedPhase === Phases.ELABORATION) {
      activePhaseContext = elaboration;
    }

    if (!activePhaseContext) {
      return { success: false, message: `No active ${assignedPhase} context provided`, errorCode: CONFLICT };
    }

    if (activePhaseContext.isFrozen) {
      return { success: false, message: `Cannot delete requirement in a frozen ${assignedPhase} phase`, errorCode: CONFLICT };
    }

    // Client access check: Only createdBy can delete their own requirement
    if (userType === UserTypes.CLIENT && currentRequirement.createdBy !== deletedBy) {
      logWithTime(`❌ [deleteRequirementService] Access denied. Client ${deletedBy} cannot delete requirement created by ${currentRequirement.createdBy}`);
      return { success: false, message: "You do not have permission to perform this action on this requirement", errorCode: FORBIDDEN };
    } else { 
      // Check Provided Admin has access to delete Requirement
      if (currentRequirement.createdInMode === WorkflowModes.MODERATION && !activePhaseContext.contributors.includes(deletedBy)) {
        logWithTime(`❌ [deleteRequirementService] Access denied. Admin ${deletedBy} is not a contributor on ${assignedPhase} ${activePhaseContext._id}`);
        return { success: false, message: "You do not have permission to perform this action on this requirement", errorCode: FORBIDDEN };
      }
    }

    // Final check: Verify activity tracker doesn't have REQUIREMENT_ISSUED event for this requirement
    const issuedEvent = await ActivityTrackerModel.findOne({
      "adminActions.targetId": requirementId,
      eventType: ACTIVITY_TRACKER_EVENTS.REQUIREMENT_ISSUED,
      isDeleted: false
    });

    if (issuedEvent) {
      logWithTime(`❌ [deleteRequirementService] Cannot delete requirement - ISSUED event found in activity tracker: ${requirementId}`);
      return { success: false, message: "Cannot delete requirements that have been issued (event already recorded)", errorCode: CONFLICT };
    }

    // Soft-delete: Set isDeleted flag
    const deletedRequirement = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy
        }
      },
      { new: true }
    );

    logWithTime(`✅ [deleteRequirementService] Requirement soft-deleted: ${requirementId}`);

    // Log activity tracker event
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.REQUIREMENT_DELETED,
      `Requirement deleted: "${deletedRequirement.title}"`,
      { deletedData: deletedRequirement.toObject(), reason: deletionReasonType, reasonDescription: deletionReasonDescription }
    );

    await manualVersionControlService({
      projectId: project._id,
      currentPhase: assignedPhase,
      action: `Requirement deleted in ${assignedPhase} phase`,
      performedBy: deletedBy,
      auditContext
    });

    return { success: true, requirement: deletedRequirement };

  } catch (error) {
    logWithTime(`❌ [deleteRequirementService] Error: ${error.message}`);
    return { success: false, message: "Internal error while deleting requirement", errorCode: INTERNAL_ERROR, error: error.message };
  }
};

module.exports = { deleteRequirementService };
