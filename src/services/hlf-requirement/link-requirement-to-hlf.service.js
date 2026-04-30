// services/requirements/link-requirement-to-hlf.service.js

const mongoose = require("mongoose");
const { RequirementModel } = require("@models/requirement.model");
const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { FeatureRequirementMappingModel } = require("@models/feature-requirement-map.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { NOT_FOUND, INTERNAL_ERROR, BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");
const { RelationTypes, ContributionTypes, MappingStatuses, Phases } = require("@configs/enums.config");
const { createRequirementToHlfService } = require("./create-requirement-to-hlf.service");

/**
 * Links a requirement to a high-level feature (creates mapping + updates requirement.parentFeatureId)
 * Only ONE PRIMARY contribution type allowed per requirement across all HLFs
 * 
 * @param {Object} params
 * @param {string} params.requirementId - The requirement being linked
 * @param {string} params.highLevelFeatureId - The HLF to link to
 * @param {string} [params.contributionTypes] - Contribution type (PRIMARY, SUPPORTING, etc.)
 * @param {string} [params.relationshipNotes] - Optional notes about the relationship
 * @param {string} params.linkedBy - User ID performing the linking
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, mapping, requirement } | { success: false, message, errorCode }}
 */
const linkRequirementToHlfService = async ({
  requirementId,
  highLevelFeatureId,
  contributionTypes,
  relationType,
  relationshipNotes,
  linkedBy,
  auditContext
}) => {
  try {
    logWithTime(
      `📍 [linkRequirementToHlfService] Linking requirement ${requirementId} to HLF ${highLevelFeatureId}`
    );

    // ── 1. Fetch requirement ───────────────────────────────────────────
    const requirement = await RequirementModel.findOne({ _id: new mongoose.Types.ObjectId(requirementId), isDeleted: false });

    if (!requirement) {
      logWithTime(`❌ [linkRequirementToHlfService] Requirement not found: ${requirementId}`);
      return {
        success: false,
        message: "Requirement not found",
        errorCode: NOT_FOUND
      };
    }

    const projectId = requirement.projectId;

    // ── 2. Fetch HLF ──────────────────────────────────────────────────
    const hlf = await HighLevelFeatureModel.findOne({ _id: new mongoose.Types.ObjectId(highLevelFeatureId), projectId: new mongoose.Types.ObjectId(projectId), isDeleted: false });

    if (!hlf) {
      logWithTime(`❌ [linkRequirementToHlfService] HLF not found: ${highLevelFeatureId}`);
      return {
        success: false,
        message: "High-level feature not found",
        errorCode: NOT_FOUND
      };
    }

    // ── 3. Check if PRIMARY mapping already exists for this requirement ───
    const isPrimary = contributionTypes === ContributionTypes.PRIMARY;

    if (isPrimary) {
      const existingPrimaryMapping = await FeatureRequirementMappingModel.findOne({
        requirementId: new mongoose.Types.ObjectId(requirementId),
        contributionType: ContributionTypes.PRIMARY,
        isDeleted: false
      });

      if (existingPrimaryMapping) {
        logWithTime(`❌ [linkRequirementToHlfService] PRIMARY mapping already exists for this requirement`);
        return {
          success: false,
          message: "A PRIMARY mapping already exists for this requirement",
          errorCode: BAD_REQUEST
        };
      }
    }

    // ── 4. Check if same mapping already exists ───────────────────────
    const existingMapping = await FeatureRequirementMappingModel.findOne({
      featureId: new mongoose.Types.ObjectId(highLevelFeatureId),
      requirementId: new mongoose.Types.ObjectId(requirementId),
      isDeleted: false
    });

    if (existingMapping) {
      // If mapping is already LINKED, throw CONFLICT
      if (existingMapping.status === MappingStatuses.LINKED) {
        logWithTime(`❌ [linkRequirementToHlfService] Mapping already LINKED for this requirement-HLF pair`);
        return {
          success: false,
          errorCode: CONFLICT,
          message: "Requirement is already mapped to this HLF"
        };
      }

      const finalRelationType = relationType || RelationTypes.RELATED_TO;
      // If mapping was unlinked, re-link it
      logWithTime(`🔄 [linkRequirementToHlfService] Re-linking previously unlinked requirement to HLF`);
      const relinkedMapping = await FeatureRequirementMappingModel.findByIdAndUpdate(
        existingMapping._id,
        {
          $set: {
            relationType: finalRelationType,
            contributionType: contributionTypes || existingMapping.contributionType,
            relationshipNotes: relationshipNotes || existingMapping.relationshipNotes,
            status: MappingStatuses.LINKED,
            unlinkReason: null,
            unlinkDescription: null,
            unlinkedAt: null,
            unlinkedBy: null,
            linkedBy: linkedBy,
            linkedAt: new Date(),
            updatedBy: linkedBy
          }
        },
        { new: true }
      );

      // Log activity tracker event for re-linking with audit data
      const { user, device, requestId } = auditContext || {};
      const auditData = prepareAuditData(existingMapping, relinkedMapping);
      
      logActivityTrackerEvent(
        user,
        device,
        requestId,
        ACTIVITY_TRACKER_EVENTS.REQUIREMENT_FEATURE_TRAMMED,
        `Requirement re-linked to HLF: "${requirement.title}" → "${hlf.title || highLevelFeatureId}"`,
        {
          ...auditData,
          adminActions: { targetId: relinkedMapping._id.toString() }
        }
      );

    manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Requirement linked to HLF: "${requirement.title}" → "${hlf.title || highLevelFeatureId}"`,
      performedBy: linkedBy,
      auditContext
    })

      return { success: true, mapping: relinkedMapping, requirement };
    }

    // ── 5. If PRIMARY, update requirement.parentFeatureId AFTER all validation checks ───────────────
    if (isPrimary) {
      // Clone original requirement for audit
      const originalRequirement = JSON.parse(JSON.stringify(requirement));

      const updatedRequirement = await RequirementModel.findByIdAndUpdate(
        requirementId,
        {
          $set: {
            parentFeatureId: new mongoose.Types.ObjectId(highLevelFeatureId),
            updatedBy: linkedBy
          }
        },
        { new: true }
      );

      logWithTime(`✅ [linkRequirementToHlfService] Requirement linked to HLF with PRIMARY contribution and parentFeatureId updated`);

      // ── 6. Log activity tracker event ──────────────────────────────────
      const { user, device, requestId } = auditContext || {};
      const auditData = prepareAuditData(originalRequirement, updatedRequirement);

      logActivityTrackerEvent(
        user,
        device,
        requestId,
        ACTIVITY_TRACKER_EVENTS.REQUIREMENT_UPDATED,
        `Requirement linked to HLF with PRIMARY contribution: "${requirement.title}" → "${hlf.title || highLevelFeatureId}"`,
        {
          ...auditData,
          adminActions: { targetId: requirementId }
        }
      );
    }

    // ── 6. Call create service to create new mapping ───────────────────
    logWithTime(`📍 [linkRequirementToHlfService] Calling createRequirementToHlfService to create new mapping`);
    
    const createResult = await createRequirementToHlfService({
      requirementId,
      highLevelFeatureId,
      projectId: requirement.projectId.toString(),
      contributionTypes,
      relationType,
      relationshipNotes,
      linkedBy,
      auditContext
    });

    if (!createResult.success) {
      logWithTime(`❌ [linkRequirementToHlfService] Failed to create mapping: ${createResult.message}`);
      return createResult;
    }

    manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Requirement linked to HLF: "${requirement.title}" → "${hlf.title || highLevelFeatureId}"`,
      performedBy: linkedBy,
      auditContext
    })
    
    logWithTime(`✅ [linkRequirementToHlfService] Mapping created successfully via createRequirementToHlfService`);

    return { success: true, mapping: createResult.mapping, requirement };

  } catch (error) {
    logWithTime(`❌ [linkRequirementToHlfService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        errorCode: INTERNAL_ERROR,
        error: error.message
      };
    }
    return {
      success: false,
      message: "Error while linking requirement to HLF",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { linkRequirementToHlfService };
