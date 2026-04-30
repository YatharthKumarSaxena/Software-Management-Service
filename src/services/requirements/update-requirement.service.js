// services/requirements/update-requirement.service.js

const mongoose = require("mongoose");
const { RequirementModel } = require("@models/requirement.model");
const { FeatureRequirementMappingModel } = require("@models/feature-requirement-map.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { CONFLICT, INTERNAL_ERROR, FORBIDDEN, BAD_REQUEST } = require("@configs/http-status.config");
const { RequirementStatuses, UserTypes, ContributionTypes, RelationTypes, WorkflowModes, Phases, MinBufferTime, PriorityLevels } = require("@configs/enums.config");
const { linkRequirementToHlfService } = require("../hlf-requirement/link-requirement-to-hlf.service");
const { unlinkRequirementToHlfService } = require("../hlf-requirement/unlink-requirement-to-hlf.service");
const { manualVersionControlService } = require("../common/version.service");

/**
 * Updates a requirement (only in DRAFT status).
 *
 * @param {Object} params
 * @param {string} params.requirementId       - Requirement MongoDB ObjectId
 * @param {Object} params.project             - Project object with currentPhase array
 * @param {string} [params.phase]             - Specific phase when multiple are active
 * @param {Object} [params.elicitation]       - Elicitation object for access check
 * @param {Object} [params.elaboration]       - Elaboration object for access check
 * @param {Object} [params.negotiation]       - Negotiation object for access check
 * @param {Object} params.updateData          - Fields to update (title, description, priority, type, tags, acceptanceCriteria, parentHlfId)
 * @param {string} params.updatedBy           - Admin ID who modified it
 * @param {string} [params.userType]          - User type for access check (CLIENT, ADMIN, etc.)
 * @param {Object} params.auditContext        - { user, device, requestId }
 *
 * @returns {{ success: true, requirement } | { success: false, message, errorCode }}
 */
const updateRequirementService = async ({
  requirementId,
  project,
  phase,
  elicitation,
  elaboration,
  negotiation,
  updateData,
  updatedBy,
  userType,
  auditContext
}) => {
  try {
    // Fetch current requirement
    const currentRequirement = await RequirementModel.findById(requirementId);

    // Check if client trying to update admin-modified requirement
    if (userType === UserTypes.CLIENT && currentRequirement.isAdminModified) {
      logWithTime(`❌ [updateRequirementService] Access denied. Client ${updatedBy} cannot edit requirement that was modified by admin`);
      return { success: false, message: "This requirement has been modified by an admin and can no longer be edited by clients", errorCode: FORBIDDEN };
    }

    // Determine active phase - same logic as create service
    const activePhases = project.currentPhase;
    let assignedPhase = null;

    if (activePhases.length === 0) {
      return { success: false, message: "Project has no active phases", errorCode: CONFLICT };
    } else if (activePhases.length === 1) {
      assignedPhase = activePhases[0];
    } else {
      // Multiple phases - require explicit specification
      if (!phase) {
        return { success: false, message: "Multiple phases are active. Please specify which phase to update requirement in.", errorCode: CONFLICT };
      }
      if (!activePhases.includes(phase)) {
        return { success: false, message: "Specified phase is not currently active for this project", errorCode: CONFLICT };
      }
      assignedPhase = phase;
    }

    // Get the active phase context object based on assignedPhase
    let activePhaseContext = null;
    if (assignedPhase === Phases.ELICITATION) {
      activePhaseContext = elicitation;
    } else if (assignedPhase === Phases.ELABORATION) {
      activePhaseContext = elaboration;
    } else if (assignedPhase === Phases.NEGOTIATION) {
      activePhaseContext = negotiation;
    }

    if (!activePhaseContext) {
      return { success: false, message: `No active ${assignedPhase} context provided`, errorCode: CONFLICT };
    }

    if (activePhaseContext.isFrozen) {
      return { success: false, message: `Cannot update requirement in a frozen ${assignedPhase} phase`, errorCode: CONFLICT };
    }

    // Client access check: Only createdBy can update their own requirement
    if (userType === UserTypes.CLIENT && currentRequirement.createdBy !== updatedBy) {
      logWithTime(`❌ [updateRequirementService] Access denied. Client ${updatedBy} cannot update requirement created by ${currentRequirement.createdBy}`);
      return { success: false, message: "You do not have permission to perform this action on this requirement", errorCode: FORBIDDEN };
    } else {
      // Admin access check: Must be contributor in MODERATION mode
      if (currentRequirement.createdInMode === WorkflowModes.MODERATION && !activePhaseContext?.contributors.includes(updatedBy)) {
        logWithTime(`❌ [updateRequirementService] Access denied. Admin ${updatedBy} is not a contributor on ${assignedPhase} ${activePhaseContext?._id}`);
        return { success: false, message: "You do not have permission to perform this action on this requirement", errorCode: FORBIDDEN };
      }
    }

    // Check status is DRAFT
    if (currentRequirement.status !== RequirementStatuses.DRAFT) {
      logWithTime(`❌ [updateRequirementService] Cannot update requirement not in DRAFT status. Current: ${currentRequirement.status}`);
      return { success: false, message: "Can only edit requirements in DRAFT status", errorCode: CONFLICT };
    }

    // ── Check proposedDate access and validation ────────────────────────────────
    if (updateData.proposedDate !== undefined) {
      // Only creator can update proposedDate
      if (currentRequirement.createdBy !== updatedBy) {
        logWithTime(`❌ [updateRequirementService] Access denied. Only creator can update proposedDate. Created by: ${currentRequirement.createdBy}, Attempting by: ${updatedBy}`);
        return {
          success: false,
          message: "Only the creator of this requirement can update the proposed date",
          errorCode: FORBIDDEN
        };
      }

      // Validate proposedDate - same checks as create service
      const now = Date.now();
      const proposed = new Date(updateData.proposedDate).getTime();

      // Get priority from updateData (if provided) or keep existing priority
      const priority = updateData.priority || currentRequirement.priority;
      let globalMin = MinBufferTime[priority] || MinBufferTime.CRITICAL;
      const minAllowed = now + globalMin;

      // Past check
      if (proposed < now) {
        logWithTime(`❌ [updateRequirementService] Proposed date is in the past: ${updateData.proposedDate}`);
        return {
          success: false,
          message: "Validation error",
          errorCode: BAD_REQUEST,
          error: "Proposed time cannot be in the past"
        };
      }

      // Minimum buffer check
      if (proposed < minAllowed) {
        logWithTime(`❌ [updateRequirementService] Proposed date does not meet minimum buffer for priority ${priority}`);
        return {
          success: false,
          message: "Validation error",
          errorCode: BAD_REQUEST,
          error: `Minimum allowed timeline for ${priority || PriorityLevels.CRITICAL} is ${globalMin / (60 * 1000)} minutes`
        };
      }
    }

    // Prepare update payload - only allow certain fields
    const allowedFields = ['title', 'description', 'priority', 'type', 'proposedDate', 'parentHlfId'];
    const updatePayload = { updatedBy, updatedAt: new Date() };

    // If admin is updating, set isAdminModified flag to true
    if (userType === UserTypes.ADMIN) {
      updatePayload.isAdminModified = true;
    }

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        // Handle nested timeline.proposedDate
        if (field === 'proposedDate') {
          updatePayload['timeline.proposedDate'] = updateData[field];
        } else {
          updatePayload[field] = updateData[field];
        }
      }
    });

  
    // Handle parentHlfId change - if HLF ID changed, unlink old then link new
    const { parentHlfId } = updateData;
    const oldHlfId = currentRequirement.parentFeatureId ? String(currentRequirement.parentFeatureId) : null;

    if (parentHlfId !== undefined && oldHlfId !== parentHlfId) {
      // If there's an old mapping, unlink it first
      if (oldHlfId) {
        const oldMapping = await FeatureRequirementMappingModel.findOne({
          featureId: new mongoose.Types.ObjectId(oldHlfId),
          requirementId: new mongoose.Types.ObjectId(requirementId),
          isDeleted: false
        });

        if (oldMapping) {
          const unlinkResult = await unlinkRequirementToHlfService({
            mappingId: oldMapping._id.toString(),
            unlinkedBy: updatedBy,
            auditContext
          });

          if (!unlinkResult.success) {
            logWithTime(`❌ [updateRequirementService] Failed to unlink old HLF mapping: ${unlinkResult.message}`);
            return {
              success: false,
              message: `Failed to unlink old HLF mapping: ${unlinkResult.message}`,
              errorCode: INTERNAL_ERROR
            };
          }
        }
      }

      // If new HLF ID is provided, link to it
      if (parentHlfId) {
        const linkResult = await linkRequirementToHlfService({
          requirementId,
          highLevelFeatureId: parentHlfId,
          contributionTypes: ContributionTypes.PRIMARY,
          relationType: updateData.relationType || RelationTypes.RELATED_TO,
          relationshipNotes: updateData.relationshipNotes || null,
          linkedBy: updatedBy,
          auditContext
        });

        if (!linkResult.success) {
          logWithTime(`❌ [updateRequirementService] Failed to link new HLF: ${linkResult.message}`);
          return {
            success: false,
            message: `Failed to link new HLF: ${linkResult.message}`,
            errorCode: INTERNAL_ERROR
          };
        }
      }

      // Update parentFeatureId in requirement
      updatePayload.parentFeatureId = parentHlfId ? new mongoose.Types.ObjectId(parentHlfId) : null;
    }

    // Update requirement
    const updatedRequirement = await RequirementModel.findByIdAndUpdate(
      requirementId,
      { $set: updatePayload },
      { new: true }
    );

    // Check if any changes were actually made using audit data utility
    const auditData = prepareAuditData(currentRequirement, updatedRequirement);
    const hasChanges = Object.keys(auditData.newData || {}).length > 0;

    if (!hasChanges) {
      logWithTime(`ℹ️ [updateRequirementService] No actual changes detected for requirement: ${requirementId}`);
      return {
        success: true,
        requirement: updatedRequirement,
        message: "Your requirement was updated but no changes were detected"
      };
    }

    logWithTime(`✅ [updateRequirementService] Requirement updated: ${requirementId}`);

    // Log activity tracker event only if changes were made
    const { user, device, requestId } = auditContext;
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.REQUIREMENT_UPDATED,
      `Requirement updated: "${updatedRequirement.title}"`,
      {
        ...auditData,
        adminActions: { targetId: requirementId }
      }
    );

    await manualVersionControlService({
      projectId: project._id,
      currentPhase: assignedPhase,
      action: `Requirement updated in ${assignedPhase} phase`,
      performedBy: updatedBy,
      auditContext
    });

    return { success: true, requirement: updatedRequirement };

  } catch (error) {
    logWithTime(`❌ [updateRequirementService] Error: ${error.message}`);
    return { success: false, message: "Internal error while updating requirement", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { updateRequirementService };
