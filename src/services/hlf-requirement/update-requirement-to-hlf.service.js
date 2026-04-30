// services/hlf-requirement/update-requirement-to-hlf.service.js

const mongoose = require("mongoose");
const { FeatureRequirementMappingModel } = require("@models/feature-requirement-map.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { INTERNAL_ERROR, BAD_REQUEST } = require("@configs/http-status.config");
const { MappingStatuses, Phases } = require("@configs/enums.config");

/**
 * Updates a requirement-to-HLF mapping (only LINKED mappings can be updated)
 * Updates relationshipNotes and relationType
 * 
 * @param {Object} params
 * @param {string} params.mappingId - The mapping ID to update
 * @param {string} [params.relationshipNotes] - Updated relationship notes
 * @param {string} [params.relationType] - Updated relationship type
 * @param {string} params.updatedBy - User ID performing the update
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, mapping, message? } | { success: false, message, errorCode }}
 */
const updateRequirementToHlfService = async ({
  mappingId,
  relationshipNotes,
  relationType,
  updatedBy,
  auditContext
}) => {
  try {
    logWithTime(
      `📍 [updateRequirementToHlfService] Updating mapping: ${mappingId}`
    );

    // ── 1. Fetch the mapping ───────────────────────────────────────────
    const mapping = await FeatureRequirementMappingModel.findById(
      new mongoose.Types.ObjectId(mappingId)
    );

    // ── 2. Check if mapping is LINKED ────────────────────────────────────
    if (mapping.status !== MappingStatuses.LINKED) {
      logWithTime(`❌ [updateRequirementToHlfService] Mapping is not LINKED. Current status: ${mapping.status}`);
      return {
        success: false,
        message: "Only LINKED mappings can be updated",
        errorCode: BAD_REQUEST
      };
    }

    // ── 3. Prepare update payload ──────────────────────────────────────
    const updatePayload = { updatedBy, updatedAt: new Date() };

    if (relationshipNotes !== undefined) {
      updatePayload.relationshipNotes = relationshipNotes || null;
    }

    if (relationType !== undefined) {
      updatePayload.relationType = relationType;
    }

    // ── 4. Update the mapping ──────────────────────────────────────────
    const updatedMapping = await FeatureRequirementMappingModel.findByIdAndUpdate(
      mappingId,
      { $set: updatePayload },
      { new: true }
    );

    logWithTime(`✅ [updateRequirementToHlfService] Mapping updated: ${mappingId}`);

    // ── 5. Check if any changes were actually made ─────────────────────
    const auditData = prepareAuditData(mapping, updatedMapping);
    const hasChanges = Object.keys(auditData.newData || {}).length > 0;

    if (!hasChanges) {
      logWithTime(`ℹ️ [updateRequirementToHlfService] No actual changes detected for mapping: ${mappingId}`);
      return {
        success: true,
        mapping: updatedMapping,
        message: "Your mapping was updated but no changes were detected"
      };
    }

    // ── 6. Log activity tracker event only if changes were made ─────────
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_FEATURE_UPDATED,
      `Mapping updated: relationshipNotes or relationType changed`,
      {
        ...auditData,
        adminActions: { targetId: mappingId }
      }
    );

    manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Requirement linked to HLF: "${requirement.title}" → "${hlf.title || highLevelFeatureId}"`,
      performedBy: linkedBy,
      auditContext
    })

    return { success: true, mapping: updatedMapping };

  } catch (error) {
    logWithTime(`❌ [updateRequirementToHlfService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error while updating mapping",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { updateRequirementToHlfService };
