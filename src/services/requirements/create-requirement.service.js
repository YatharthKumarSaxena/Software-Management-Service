// services/requirements/create-requirement.service.js

const mongoose = require("mongoose");
const { RequirementModel } = require("@models/requirement.model");
const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR, BAD_REQUEST, NOT_FOUND, CONFLICT } = require("@configs/http-status.config");
const { RequirementStatuses, RequirementTypes, RequirementSources, MinBufferTime, ContributionTypes, PriorityLevels, RelationTypes, Phases } = require("@configs/enums.config");
const { linkRequirementToHlfService } = require("../hlf-requirement/link-requirement-to-hlf.service");
const { manualVersionControlService } = require("../common/version.service");
const { counterServices } = require("@services/common/counter.service");

const createRequirementService = async ({
  project,
  elicitation,
  elaboration,
  phase,
  title,
  description,
  priority,
  type = RequirementTypes.FUNCTIONAL,
  proposedDate,
  source = RequirementSources.MANUAL,
  createdBy,
  parentHlfId,
  relationType,
  relationshipNotes,
  auditContext
}) => {
  try {

    const projectId = project._id.toString();
    const elicitationId = elicitation ? elicitation._id.toString() : null;
    const elaborationId = elaboration ? elaboration._id.toString() : null;

    const activePhases = project.currentPhase;

    if (proposedDate) {
      const now = Date.now();
      const proposed = new Date(proposedDate).getTime();

      let globalMin = null;
      if (priority) globalMin = MinBufferTime[priority];
      else globalMin = MinBufferTime.CRITICAL; // Default to shortest buffer if priority not provided

      const minAllowed = now + globalMin;

      // Past check
      if (proposed < now) {
        return { success: false, message: "Validation error", errorCode: BAD_REQUEST, error: "Proposed time cannot be in the past" };
      }

      // Minimum buffer check
      if (proposed < minAllowed) {
        return { success: false, message: "Validation error", errorCode: BAD_REQUEST, error: `Minimum allowed timeline for ${priority || PriorityLevels.CRITICAL} is ${globalMin / (60 * 1000)} minutes` };
      }
    }

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
      [Phases.ELABORATION]: elaboration
    };
    const phaseContext = phaseContextMap[assignedPhase];

    // ── Check if phase context exists (not frozen/missing) ────────────────
    if (!phaseContext) {
      return { success: false, message: `No Active ${assignedPhase} Exists`, errorCode: CONFLICT };
    }

    if (phaseContext.isFrozen) {
      return { success: false, message: "Cannot create requirement in a frozen phase", errorCode: CONFLICT };
    }

    // ── Validate user is a collaborator ──────────────────────────────────
    if (phaseContext.workflowMode === WorkflowModes.MODERATION && !phaseContext.contributors.includes(createdBy)) {
      return { success: false, message: `User is not a contributor for ${assignedPhase}`, errorCode: CONFLICT };
    }

    if (parentHlfId) {
      // Validate parentHlfId exists and belongs to the same project
      const parentFeature = await HighLevelFeatureModel.findOne({ _id: parentHlfId, projectId, isDeleted: false });
      if (!parentFeature) {
        return { success: false, message: "Validation error", errorCode: NOT_FOUND, error: "Parent high-level feature not found in the project" };
      }
    }

    // ── Map phase to entity properties ───────────────────────────────────
    const entityIdMap = {
      [Phases.ELICITATION]: elicitationId,
      [Phases.ELABORATION]: elaborationId
    };
    const entityTypeMap = {
      [Phases.ELICITATION]: DB_COLLECTIONS.ELICITATIONS,
      [Phases.ELABORATION]: DB_COLLECTIONS.ELABORATIONS
    };

    const entityId = entityIdMap[assignedPhase];
    const entityType = entityTypeMap[assignedPhase];
    const createdInMode = phaseContext.workflowMode;

    // ── Call counter service to get sequence and id ──────────────────────────
    const counterResult = await counterServices.requirementCounterService(projectId);
    if (!counterResult.success) {
      logWithTime(`❌ [createRequirementService] Error generating Requirement sequence for project: ${projectId}`);
      return { success: false, message: "Failed to generate Requirement sequence", errorCode: INTERNAL_ERROR };
    }

    // Create requirement
    const newRequirement = new RequirementModel({
      projectId: new mongoose.Types.ObjectId(projectId),
      entityType: entityType,
      entityId: new mongoose.Types.ObjectId(entityId),
      title: title.trim(),
      description: description ? description.trim() : null,
      priority,
      type, 
      source,
      status: RequirementStatuses.DRAFT,
      createdInMode,
      timeline: {
        proposedDate: proposedDate,
        expectedDeliveryDate: null
      },
      sequence: counterResult.sequence,
      id: counterResult.generatedId,
      createdBy,
      isDeleted: false,
      parentFeatureId: null
    });

    const savedRequirement = await newRequirement.save();

    logWithTime(`✅ [createRequirementService] Requirement created: ${savedRequirement._id}`);

    // Auto-create HLF mapping if parentHlfId provided
    if (parentHlfId) {
      if (!relationType) {
        relationType = RelationTypes.DERIVED_FROM;
      }
      try {
        const linkResult = await linkRequirementToHlfService({
          requirementId: savedRequirement._id.toString(),
          highLevelFeatureId: parentHlfId, 
          contributionTypes: ContributionTypes.PRIMARY,
          relationType,
          relationshipNotes,
          linkedBy: createdBy,
          auditContext
        });
        
        if (!linkResult.success) {
          logWithTime(`⚠️ [createRequirementService] Error linking to HLF: ${linkResult.message}`);
          // Note: Requirement is created but linking failed - logging only, requirement still returned as success
        }
      } catch (linkError) {
        logWithTime(`⚠️ [createRequirementService] Error linking to HLF: ${linkError.message}`);
      }
    }

    // Log activity tracker event (fire-and-forget)
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.REQUIREMENT_CREATED,
      `Requirement created: "${title}"`,
      { newData: savedRequirement.toObject(), adminActions: { targetId: savedRequirement._id.toString() } }
    );

    manualVersionControlService({
      projectId,
      currentPhase: assignedPhase,
      action: `Requirement created in ${assignedPhase} phase`,
      performedBy: createdBy,
      auditContext
    });
    return { success: true, requirement: savedRequirement };

  } catch (error) {
    logWithTime(`❌ [createRequirementService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", errorCode: INTERNAL_ERROR, error: error.message };
    }
    return { success: false, message: "Internal error while creating requirement", errorCode: INTERNAL_ERROR, error: error.message };
  }
};

module.exports = { createRequirementService };