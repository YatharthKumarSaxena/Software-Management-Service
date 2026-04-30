// services/hlf-requirement/unlink-requirement-to-hlf.service.js

const mongoose = require("mongoose");
const { FeatureRequirementMappingModel } = require("@models/feature-requirement-map.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { prepareAuditData } = require("@utils/audit-data.util");
const { NOT_FOUND, INTERNAL_ERROR, CONFLICT } = require("@configs/http-status.config");
const { MappingStatuses, Phases } = require("@configs/enums.config");

/**
 * Unlinks a requirement from a high-level feature by changing status to UNLINKED
 * Checks if already unlinked - if yes throws CONFLICT
 * 
 * @param {Object} params
 * @param {string} params.mappingId - The mapping ID to unlink
 * @param {string} [params.unlinkReason] - Reason for unlinking
 * @param {string} [params.unlinkDescription] - Description of unlink reason
 * @param {string} params.unlinkedBy - User ID performing the unlink
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, mapping } | { success: false, message, errorCode }}
 */
const unlinkRequirementToHlfService = async ({
  mappingId,
  unlinkReason,
  unlinkDescription,
  unlinkedBy,
  auditContext
}) => {
  try {
    logWithTime(
      `📍 [unlinkRequirementToHlfService] Unlinking mapping ${mappingId}`
    );

    // ── 1. Fetch the mapping ───────────────────────────────────────────
    const mapping = await FeatureRequirementMappingModel.findById(
      new mongoose.Types.ObjectId(mappingId)
    );

    if (!mapping) {
      logWithTime(`❌ [unlinkRequirementToHlfService] Mapping not found with ID ${mappingId}`);
      return {
        success: false,
        message: "Mapping not found",
        errorCode: NOT_FOUND
      };
    }

    // ── 2. Check if already unlinked ────────────────────────────────────
    if (mapping.status === MappingStatuses.UNLINKED) {
      logWithTime(`❌ [unlinkRequirementToHlfService] Mapping already UNLINKED for requirement-HLF pair`);
      return {
        success: false,
        errorCode: CONFLICT,
        message: "Requirement is already unlinked from this HLF"
      };
    }

    // ── 3. Unlink the mapping by changing status ────────────────────────
    logWithTime(`🔗 [unlinkRequirementToHlfService] Unlinking requirement from HLF`);
    const unlinkedMapping = await FeatureRequirementMappingModel.findByIdAndUpdate(
      mapping._id,
      {
        $set: {
          status: MappingStatuses.UNLINKED,
          unlinkReason: unlinkReason || null,
          unlinkDescription: unlinkDescription || null,
          unlinkedAt: new Date(),
          unlinkedBy: unlinkedBy,
          updatedBy: unlinkedBy
        }
      },
      { new: true }
    );

    logWithTime(`✅ [unlinkRequirementToHlfService] Mapping unlinked successfully`);

    // ── 4. Log activity tracker event with audit data ───────────────────
    const { user, device, requestId } = auditContext || {};
    const auditData = prepareAuditData(mapping, unlinkedMapping);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_FEATURE_UNLINKED,
      `Requirement unlinked from HLF: mapping ${mapping._id}`,
      {
        ...auditData,
        adminActions: { targetId: unlinkedMapping._id.toString() }
      }
    );

    manualVersionControlService({
      projectId: requirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Requirement linked to HLF: "${requirement.title}" → "${hlf.title || highLevelFeatureId}"`,
      performedBy: linkedBy,
      auditContext
    })

    return { success: true, mapping: unlinkedMapping };

  } catch (error) {
    logWithTime(`❌ [unlinkRequirementToHlfService] Error: ${error.message}`);
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
      message: "Error while unlinking requirement from HLF",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { unlinkRequirementToHlfService };
