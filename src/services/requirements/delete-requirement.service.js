// services/requirements/delete-requirement.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR, FORBIDDEN, CONFLICT, NOT_FOUND } = require("@configs/http-status.config");
const { UserTypes, RequirementStatuses, Phases } = require("@configs/enums.config");
const { ActivityTrackerModel } = require("@/models");
const { manualVersionControlService } = require("../common/version.service");
const { validatePhaseContext } = require("@services/common/phase-context.service");
const { resolveActivePhase } = require("@services/common/phase-resolution.service");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

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

    if (!currentRequirement) {
      return {
        success: false,
        message: "Requirement not found",
        errorCode: NOT_FOUND
      };
    }

    // Check if client trying to delete admin-modified requirement
    if (userType === UserTypes.CLIENT && currentRequirement.isAdminModified) {
      logWithTime(`❌ [deleteRequirementService] Access denied. Client ${deletedBy} cannot delete requirement that was modified by admin`);
      return { success: false, message: "This requirement has been modified by an admin and can no longer be deleted by clients", errorCode: FORBIDDEN };
    }

    const phaseResult = resolveActivePhase({
      activePhases: project.currentPhase,
      supportedPhases: [
        Phases.ELICITATION,
        Phases.ELABORATION
      ],
      selectedPhase: phase
    });

    if (!phaseResult.success) {
      return phaseResult;
    }

    const assignedPhase = phaseResult.phase;

    // Check if requirement is in DRAFT status - cannot delete non-draft requirements
    if (currentRequirement.status !== RequirementStatuses.DRAFT) {
      logWithTime(`❌ [deleteRequirementService] Cannot delete requirement in ${currentRequirement.status} status: ${requirementId}`);
      return { success: false, message: "Cannot delete requirements that are not in DRAFT status", errorCode: CONFLICT };
    }

    // Get the active phase context object
    const phaseConfigMap = {
      [Phases.ELICITATION]: {
        context: elicitation
      },

      [Phases.ELABORATION]: {
        context: elaboration
      }
    };

    const phaseValidation = validatePhaseContext({
      phase: assignedPhase,
      phaseContext: phaseConfigMap[assignedPhase]?.context,
      userId: deletedBy
    });

    if (!phaseValidation.success) {
      return phaseValidation;
    }

    // Client access check: Only createdBy can delete their own requirement
    if (userType === UserTypes.CLIENT && currentRequirement.createdBy !== deletedBy) {
      logWithTime(`❌ [deleteRequirementService] Access denied. Client ${deletedBy} cannot delete requirement created by ${currentRequirement.createdBy}`);
      return { success: false, message: "You do not have permission to perform this action on this requirement", errorCode: FORBIDDEN };
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
    const { user, device, requestId, workflowId } = auditContext || {};
    logActivityTrackerEvent({
      user: user,
      device: device,
      requestId,
      workflowId: workflowId,
      eventType: ACTIVITY_TRACKER_EVENTS.REQUIREMENT_DELETED,
      description: `Requirement deleted: "${deletedRequirement.title}"`,
      logOptions: { oldData: currentRequirement.toObject(), newData: deletedRequirement.toObject(), userActions: { reason: deletionReasonType, reasonDescription: deletionReasonDescription, targetId: requirementId, performedOn: DB_COLLECTIONS.REQUIREMENTS } }
    });

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
