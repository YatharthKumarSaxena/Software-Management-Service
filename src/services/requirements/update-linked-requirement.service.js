// services/requirements/update-linked-requirement.service.js

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
 * Updates a specific linked requirement's relationType and/or relationshipNotes
 * 
 * @param {Object} params
 * @param {string} params.requirementId - The requirement being updated
 * @param {string} params.linkedRequirementId - The specific linked requirement to update
 * @param {string} [params.relationType] - New relation type (optional if only updating notes)
 * @param {string} [params.relationshipNotes] - New relationship notes (optional if only updating type)
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, requirement } | { success: false, message, errorCode }}
 */
const updateLinkedRequirementService = async ({
  requirementId,
  linkedRequirementId,
  relationType,
  relationshipNotes,
  auditContext
}) => {
  try {
    logWithTime(
      `📍 [updateLinkedRequirementService] Starting update for link: ${linkedRequirementId} in requirement: ${requirementId}`
    );

    // ── 1. Validate at least one update field is provided ────────────────────
    if (!relationType && relationshipNotes === undefined) {
      logWithTime(`❌ [updateLinkedRequirementService] No update fields provided`);
      return {
        success: false,
        message: "At least one field (relationType or relationshipNotes) must be provided for update",
        errorCode: BAD_REQUEST
      };
    }

    // ── 4. Fetch source requirement ──────────────────────────────────────────
    const sourceRequirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    // ── 5. Check if requirement has linked requirements ──────────────────────
    if (!sourceRequirement.linkedRequirements || sourceRequirement.linkedRequirements.length === 0) {
      logWithTime(`❌ [updateLinkedRequirementService] Requirement has no linked requirements: ${requirementId}`);
      return {
        success: false,
        message: "This requirement has no linked requirements",
        errorCode: CONFLICT
      };
    }

    // ── 6. Find the specific link to update ──────────────────────────────────
    const linkedRequirementIdObj = new mongoose.Types.ObjectId(linkedRequirementId);
    const linkIndex = sourceRequirement.linkedRequirements.findIndex(
      link => String(link.requirementId) === String(linkedRequirementIdObj)
    );

    if (linkIndex === -1) {
      logWithTime(`❌ [updateLinkedRequirementService] Linked requirement not found: ${linkedRequirementId}`);
      return {
        success: false,
        message: `The requirement ${linkedRequirementId} is not linked to this requirement`,
        errorCode: CONFLICT
      };
    }

    const oldRequirement = sourceRequirement.toObject ? sourceRequirement.toObject() : { ...sourceRequirement };

    // ── 7. Update the linked requirement ────────────────────────────────────
    const oldLink = { ...sourceRequirement.linkedRequirements[linkIndex] };

    if (relationType) {
      sourceRequirement.linkedRequirements[linkIndex].relationType = relationType;
    }

    if (relationshipNotes !== undefined) {
      sourceRequirement.linkedRequirements[linkIndex].relationshipNotes = relationshipNotes === null ? null : relationshipNotes.trim();
    }

    // Set updatedBy and updatedAt on the linked requirement object
    sourceRequirement.linkedRequirements[linkIndex].updatedBy = auditContext?.user?.adminId;
    sourceRequirement.linkedRequirements[linkIndex].updatedAt = new Date();

    sourceRequirement.updatedBy = auditContext?.user?.adminId;
    const updated = await sourceRequirement.save();

    logWithTime(`✅ [updateLinkedRequirementService] Link updated successfully`);

    const auditData = prepareAuditData(oldRequirement, updated);

    // ── 8. Log activity tracker event ───────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const updateFields = [];
    if (relationType) updateFields.push(`relationType to ${relationType}`);
    if (relationshipNotes !== undefined) updateFields.push("relationshipNotes");

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_LINK_UPDATED,
      `Linked requirement ${linkedRequirementId} updated: ${updateFields.join(", ")}`,
      {
        ...auditData,
        adminActions: { targetId: updated._id.toString() }
      }
    );

    // ── 9. Call version control service ───────────────────────────────────────
    await manualVersionControlService({
      projectId: sourceRequirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Linked requirement updated: ${updateFields.join(", ")}`,
      performedBy: auditContext?.user?.adminId,
      auditContext
    });

    return { success: true, requirement: updated };

  } catch (error) {
    logWithTime(`❌ [updateLinkedRequirementService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        errorCode: INTERNAL_ERROR,
        error: error.message
      };
    }
    if (error.message.includes("Cast to ObjectId failed")) {
      return {
        success: false,
        message: "Invalid ID format",
        errorCode: BAD_REQUEST,
        error: error.message
      };
    }
    return {
      success: false,
      message: "Error while updating linked requirement",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { updateLinkedRequirementService };
