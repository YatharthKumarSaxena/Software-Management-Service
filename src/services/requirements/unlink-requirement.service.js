// services/requirements/unlink-requirement.service.js

const mongoose = require("mongoose");
const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR, BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");
const { manualVersionControlService } = require("../common/version.service");
const { Phases } = require("@/configs/enums.config");
const { prepareAuditData } = require("@/utils/audit-data.util");

/**
 * Unlinks one requirement from multiple linked requirements
 * 
 * @param {Object} params
 * @param {string} params.requirementId - The requirement being unlinked from (source)
 * @param {Array<string>} params.linkedRequirementIds - Array of requirement IDs to unlink
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * @param {string} params.unlinkedBy - User ID performing the unlinking
 * 
 * @returns {{ success: true, requirement } | { success: false, message, errorCode }}
 */
const unlinkRequirementService = async ({
  requirementId,
  linkedRequirementIds, // Array of requirement IDs to remove from linkedRequirements
  auditContext,
  unlinkedBy
}) => {
  try {
    logWithTime(
      `📍 [unlinkRequirementService] Starting requirement unlinking: ${requirementId}`
    );

    // ── 1. Validate linkedRequirementIds array ──────────────────────────────
    if (!Array.isArray(linkedRequirementIds) || linkedRequirementIds.length === 0) {
      logWithTime(`❌ [unlinkRequirementService] Invalid linkedRequirementIds: must be non-empty array`);
      return {
        success: false,
        message: "linkedRequirementIds must be a non-empty array",
        errorCode: BAD_REQUEST
      };
    }

    // ── 2. Fetch source requirement ──────────────────────────────────────────
    const sourceRequirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    // ── 3. Check if requirement has any linked requirements ──────────────────
    if (!sourceRequirement.linkedRequirements || sourceRequirement.linkedRequirements.length === 0) {
      logWithTime(`❌ [unlinkRequirementService] Requirement has no linked requirements: ${requirementId}`);
      return {
        success: false,
        message: "This requirement has no linked requirements to unlink",
        errorCode: CONFLICT
      };
    }

    // ── 4. Verify all IDs to unlink are present in linkedRequirements ────────
    const linkedIds = new Set(sourceRequirement.linkedRequirements.map(link => String(link.requirementId)));
    const idsToRemove = linkedRequirementIds.map(id => String(id));
    
    const notFoundIds = idsToRemove.filter(id => !linkedIds.has(id));

    if (notFoundIds.length > 0) {
      logWithTime(`❌ [unlinkRequirementService] Following requirements are not linked: ${notFoundIds.join(", ")}`);
      return {
        success: false,
        message: `The following requirement(s) are not linked: ${notFoundIds.join(", ")}`,
        errorCode: CONFLICT
      };
    }

    const oldRequirement = sourceRequirement.toObject ? sourceRequirement.toObject() : { ...sourceRequirement };

    // ── 5. Remove linked requirements using $pull ───────────────────────────
    const updated = await RequirementModel.findByIdAndUpdate(
      requirementId,
      {
        $pull: { linkedRequirements: { requirementId: { $in: linkedRequirementIds.map(id => new mongoose.Types.ObjectId(id)) } } },
        $set: { updatedBy: auditContext?.user?.adminId }
      },
      { new: true }
    );

    logWithTime(`✅ [unlinkRequirementService] Requirement ${requirementId} unlinked from ${linkedRequirementIds.length} link(s) successfully`);

    const auditData = prepareAuditData(oldRequirement, updated);

    // ── 6. Log activity tracker event ───────────────────────────────────────
    const { user, device, requestId } = auditContext || {};

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_UNLINKED,
      `Requirement unlinked from ${linkedRequirementIds.length} other requirement(s)`,
      {
        ...auditData,
        adminActions: { targetId: updated._id.toString() }
      }
    );

    // ── 7. Call version control service ───────────────────────────────────────
    await manualVersionControlService({
      projectId: sourceRequirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Requirement unlinked from ${linkedRequirementIds.length} other requirement(s)`,
      performedBy: auditContext?.user?.adminId,
      auditContext
    });

    return { success: true, requirement: updated };

  } catch (error) {
    logWithTime(`❌ [unlinkRequirementService] Error: ${error.message}`);
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
      message: "Error while unlinking requirement",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { unlinkRequirementService };
