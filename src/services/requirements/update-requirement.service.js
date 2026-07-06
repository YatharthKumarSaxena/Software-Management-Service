// services/requirements/update-requirement.service.js

const mongoose = require("mongoose");
const { RequirementModel } = require("@models/requirement.model");
const { FeatureRequirementMappingModel } = require("@models/feature-requirement-map.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { CONFLICT, INTERNAL_ERROR, FORBIDDEN, BAD_REQUEST, NOT_FOUND } = require("@configs/http-status.config");
const { RequirementStatuses, TotalTypes, ContributionTypes, RelationTypes, MappingStatuses, Phases, MinBufferTime, PriorityLevels } = require("@configs/enums.config");
const { linkRequirementToHlfService } = require("../hlf-requirement/link-requirement-to-hlf.service");
const { unlinkRequirementToHlfService } = require("../hlf-requirement/unlink-requirement-to-hlf.service");
const { manualVersionControlService } = require("../common/version.service");
const { resolveActivePhase } = require("@services/common/phase-resolution.service");
const { validatePhaseContext } = require("@services/common/phase-context.service");

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
 * @param {Object} params.updateData          - Fields to update (title, description, priority, type, proposedDate, parentHlfId, relationType, relationshipNotes)
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

    if (!currentRequirement) {
      return {
        success: false,
        message: "Requirement not found",
        errorCode: NOT_FOUND
      };
    }

    // Check if client trying to update admin-modified requirement
    if (userType === TotalTypes.CLIENT && currentRequirement.isAdminModified) {
      logWithTime(`❌ [updateRequirementService] Access denied. Client ${updatedBy} cannot edit requirement that was modified by admin`);
      return { success: false, message: "This requirement has been modified by an admin and can no longer be edited by clients", errorCode: FORBIDDEN };
    }

    // ── Phase resolution using utility ──────────────────────────────────────
    const phaseConfigMap = {
      [Phases.ELICITATION]: {
        context: elicitation,
        entityId: elicitation ? elicitation._id.toString() : null,
        entityType: DB_COLLECTIONS.ELICITATIONS
      },
      [Phases.ELABORATION]: {
        context: elaboration,
        entityId: elaboration ? elaboration._id.toString() : null,
        entityType: DB_COLLECTIONS.ELABORATIONS
      },
      [Phases.NEGOTIATION]: {
        context: negotiation,
        entityId: negotiation ? negotiation._id.toString() : null,
        entityType: DB_COLLECTIONS.NEGOTIATIONS
      }
    };

    const phaseResult = resolveActivePhase({
      activePhases: project.currentPhase,
      supportedPhases: [Phases.ELICITATION, Phases.ELABORATION, Phases.NEGOTIATION],
      selectedPhase: phase
    });

    if (!phaseResult.success) {
      return phaseResult;
    }

    const assignedPhase = phaseResult.phase;
    const phaseConfig = phaseConfigMap[assignedPhase];
    const activePhaseContext = phaseConfig?.context;

    // ── Phase context validation using utility ─────────────────────────────
    const phaseValidation = validatePhaseContext({
      phase: assignedPhase,
      phaseContext: activePhaseContext,
      userId: updatedBy
    });

    if (!phaseValidation.success) {
      return phaseValidation;
    }

    // ── Access control checks ──────────────────────────────────────────────
    // Client access check: Only createdBy can update their own requirement
    if (userType === TotalTypes.CLIENT && currentRequirement.createdBy !== updatedBy) {
      logWithTime(`❌ [updateRequirementService] Access denied. Client ${updatedBy} cannot update requirement created by ${currentRequirement.createdBy}`);
      return { success: false, message: "You do not have permission to perform this action on this requirement", errorCode: FORBIDDEN };
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

    // ── Check if any business fields actually changed ───────────────────────
    let hasBusinessChanges = false;

    if (updateData.title !== undefined && updateData.title !== currentRequirement.title) {
      const normalizedTitle = updateData.title.trim().replace(/\s+/g, " ");
      
      const existingRequirement = await RequirementModel.findOne({
        projectId: project._id,
        title: normalizedTitle,
        isDeleted: false,
        _id: { $ne: requirementId }
      }).collation({
        locale: "en",
        strength: 2
      });

      if (existingRequirement) {
        return {
          success: false,
          message: "Requirement with same title already exists",
          errorCode: CONFLICT
        };
      }
      hasBusinessChanges = true;
    }
    if (updateData.description !== undefined && updateData.description !== currentRequirement.description) {
      hasBusinessChanges = true;
    }
    if (updateData.priority !== undefined && updateData.priority !== currentRequirement.priority) {
      hasBusinessChanges = true;
    }
    if (updateData.type !== undefined && updateData.type !== currentRequirement.type) {
      hasBusinessChanges = true;
    }

    if (updateData.proposedDate !== undefined) {
      const currentProposedDate = currentRequirement.timeline?.proposedDate;
      const currentProposedTime = currentProposedDate ? new Date(currentProposedDate).getTime() : null;
      const newProposedTime = new Date(updateData.proposedDate).getTime();
      if (currentProposedTime !== newProposedTime) {
        hasBusinessChanges = true;
      }
    }

    if (!hasBusinessChanges) {
      logWithTime(`ℹ️ [updateRequirementService] No actual changes detected for requirement: ${requirementId}`);
      return {
        success: true,
        requirement: currentRequirement,
        message: "No changes detected"
      };
    }

    // ── Prepare update payload ──────────────────────────────────────────────
    const allowedFields = ['title', 'description', 'priority', 'type', 'proposedDate'];
    const updatePayload = { updatedBy, updatedAt: new Date() };

    // If admin is updating, set isAdminModified flag to true
    if (userType === TotalTypes.ADMIN) {
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

    // ── Handle PRIMARY HLF mapping change ──────────────────────────────────────
    const { parentHlfId } = updateData;
    let oldHlfId = null;
    if (
      userType !== TotalTypes.CLIENT &&
      parentHlfId !== undefined &&
      parentHlfId !== null
    ) {
      const existingPrimaryMapping =
        await FeatureRequirementMappingModel.findOne({
          requirementId: new mongoose.Types.ObjectId(requirementId),
          contributionType: ContributionTypes.PRIMARY,
          status: MappingStatuses.LINKED
        });

      oldHlfId = existingPrimaryMapping
        ? existingPrimaryMapping.featureId.toString()
        : null;
      // Proceed only if mapping actually changed
      if (oldHlfId !== parentHlfId) {
        // Remove old primary mapping
        if (existingPrimaryMapping) {
          const unlinkResult = await unlinkRequirementToHlfService({
            mappingId: existingPrimaryMapping._id.toString(),
            unlinkedBy: updatedBy,
            auditContext
          });

          if (!unlinkResult.success) {
            logWithTime(
              `❌ [updateRequirementService] Failed to unlink old HLF mapping: ${unlinkResult.message}`
            );

            return {
              success: false,
              message: `Failed to unlink old HLF mapping: ${unlinkResult.message}`,
              errorCode: INTERNAL_ERROR
            };
          }
        }

        // Create new primary mapping

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
          logWithTime(
            `❌ [updateRequirementService] Failed to link new HLF: ${linkResult.message}`
          );

          return {
            success: false,
            message: `Failed to link new HLF: ${linkResult.message}`,
            errorCode: INTERNAL_ERROR
          };

        }
      }
    }

    // Update requirement
    const updatedRequirement = await RequirementModel.findByIdAndUpdate(
      requirementId,
      { $set: updatePayload },
      { new: true }
    );

    // Generate audit data
    const auditData = prepareAuditData(currentRequirement, updatedRequirement);

    logWithTime(`✅ [updateRequirementService] Requirement updated: ${requirementId}`);

    // Log activity tracker event only if changes were made
    const { user, device, requestId } = auditContext;
    logActivityTrackerEvent({
      user, device, requestId, eventType: ACTIVITY_TRACKER_EVENTS.REQUIREMENT_UPDATED,
      description: `Requirement updated: "${updatedRequirement.title}"`,
      logOptions: {
        ...auditData,
        userActions: { targetId: requirementId, performedOn: DB_COLLECTIONS.REQUIREMENTS }
      }
    });

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
