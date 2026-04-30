// services/hlf-requirement/create-requirement-to-hlf.service.js

const mongoose = require("mongoose");
const { FeatureRequirementMappingModel } = require("@models/feature-requirement-map.model");
const { RequirementModel } = require("@models/requirement.model");
const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR, CONFLICT } = require("@configs/http-status.config");
const { RelationTypes, ContributionTypes, Phases } = require("@configs/enums.config");
const { manualVersionControlService } = require("../common/version.service");

/**
 * Creates a new mapping between requirement and HLF
 * Called ONLY when mapping doesn't exist
 *
 * @param {Object} params
 * @param {string} params.requirementId - The requirement being linked
 * @param {string} params.highLevelFeatureId - The HLF to link to
 * @param {string} params.projectId - Project ID
 * @param {string} [params.contributionTypes] - Contribution type (PRIMARY, SUPPORTING, etc.)
 * @param {string} [params.relationType] - Relationship type
 * @param {string} [params.relationshipNotes] - Optional notes
 * @param {string} params.linkedBy - User ID performing the linking
 * @param {Object} [params.auditContext] - { user, device, requestId }
 *
 * @returns {{ success: true, mapping } | { success: false, message, errorCode }}
 */
const createRequirementToHlfService = async ({
  requirementId,
  highLevelFeatureId,
  projectId,
  contributionTypes,
  relationType,
  relationshipNotes,
  linkedBy,
  auditContext
}) => {
  try {
    logWithTime(
      `📍 [createRequirementToHlfService] Creating mapping for requirement ${requirementId} to HLF ${highLevelFeatureId}`
    );

    // ── Validate requirement exists ────────────────────────────────────
    const requirement = await RequirementModel.findOne({
      _id: new mongoose.Types.ObjectId(requirementId),
      projectId: new mongoose.Types.ObjectId(projectId),
      isDeleted: false
    });

    if (!requirement) {
      logWithTime(`❌ [createRequirementToHlfService] Requirement not found: ${requirementId}`);
      return {
        success: false,
        message: "Requirement not found",
        errorCode: NOT_FOUND
      };
    }

    // ── Validate HLF exists ───────────────────────────────────────────
    const hlf = await HighLevelFeatureModel.findOne({
      _id: new mongoose.Types.ObjectId(highLevelFeatureId),
      projectId: new mongoose.Types.ObjectId(projectId),
      isDeleted: false
    });


    if (!hlf) {
      logWithTime(`❌ [createRequirementToHlfService] HLF not found: ${highLevelFeatureId}`);
      return {
        success: false,
        message: "High-level feature not found",
        errorCode: NOT_FOUND
      };
    }

    const checkExistingMapping = await FeatureRequirementMappingModel.findOne({
      requirementId: new mongoose.Types.ObjectId(requirementId),
      featureId: new mongoose.Types.ObjectId(highLevelFeatureId)
    });

    if (checkExistingMapping) {
      logWithTime(`❌ [createRequirementToHlfService] Mapping already exists for this requirement-HLF pair`);
      return {
        success: false,
        message: "Requirement is already mapped to this HLF",
        errorCode: CONFLICT
      };
    }

    // ── Create mapping ─────────────────────────────────────────────────
    const RelationType = relationType || RelationTypes.RELATED_TO;

    const newMapping = new FeatureRequirementMappingModel({
      projectId: new mongoose.Types.ObjectId(projectId),
      featureId: new mongoose.Types.ObjectId(highLevelFeatureId),
      requirementId: new mongoose.Types.ObjectId(requirementId),
      relationType: RelationType,
      contributionType: contributionTypes || ContributionTypes.SUPPORTING,
      relationshipNotes: relationshipNotes || null,
      linkedBy: linkedBy,
      createdBy: linkedBy,
      isDeleted: false
    });

    const savedMapping = await newMapping.save();

    logWithTime(`✅ [createRequirementToHlfService] Mapping created successfully: ${savedMapping._id}`);

    // ── Log activity tracker event ─────────────────────────────────────
    const { user, device, requestId } = auditContext || {};

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_FEATURE_TRAMMED,
      `Requirement linked to HLF: "${requirement.title}" → "${hlf.title || highLevelFeatureId}"`,
      {
        newData: savedMapping.toObject(),
        adminActions: { targetId: savedMapping._id.toString() }
      }
    );

    manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Requirement linked to HLF: "${requirement.title}" → "${hlf.title || highLevelFeatureId}"`,
      performedBy: linkedBy,
      auditContext
    })

    return { success: true, mapping: savedMapping };

  } catch (error) {
    logWithTime(`❌ [createRequirementToHlfService] Error: ${error.message}`);
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
      message: "Error while creating requirement-HLF mapping",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { createRequirementToHlfService };
