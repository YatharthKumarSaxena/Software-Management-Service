// services/requirements/link-requirement.service.js

const mongoose = require("mongoose");
const { RequirementModel } = require("@models/requirement.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR, BAD_REQUEST } = require("@configs/http-status.config");
const { RelationTypesHelper } = require("@utils/enum-validators.util");
const { detectCircularRequirementLink } = require("@services/common/detect-circular-requirement-link.service");
const { manualVersionControlService } = require("../common/version.service");
const { Phases } = require("@/configs/enums.config");
const { descriptionLength } = require("@/configs/fields-length.config");

/**
 * Links one requirement to multiple other requirements with relation types
 * 
 * @param {Object} params
 * @param {string} params.requirementId - The requirement being linked (source)
 * @param {Array<{requirementId: string, relationType: string, relationshipNotes?: string}>} params.linkedRequirementIds - Array of links with optional notes
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * @param {string} params.linkedBy - User ID performing the linking
 * 
 * @returns {{ success: true, requirement } | { success: false, message, errorCode }}
 */
const linkRequirementService = async ({
  requirementId,
  linkedRequirementIds, // Array of { requirementId, relationType, relationshipNotes (optional) }
  auditContext,
  linkedBy
}) => {
  try {
    logWithTime(
      `📍 [linkRequirementService] Starting requirement linking: ${requirementId}`
    );

    // ── 1. Validate linkedRequirementIds array ──────────────────────────────
    if (!Array.isArray(linkedRequirementIds) || linkedRequirementIds.length === 0) {
      logWithTime(`❌ [linkRequirementService] Invalid linkedRequirementIds: must be non-empty array`);
      return {
        success: false,
        message: "linkedRequirementIds must be a non-empty array",
        errorCode: BAD_REQUEST
      };
    }

    // ── 2. EARLY: Validate all relationTypes BEFORE DB queries ───────────────
    const invalidRelationTypes = linkedRequirementIds.filter(
      link => !RelationTypesHelper.reverseLookup(link.relationType)
    );

    if (invalidRelationTypes.length > 0) {
      logWithTime(`❌ [linkRequirementService] Invalid relationType(s) detected`);
      return {
        success: false,
        message: "One or more invalid relationType values provided",
        errorCode: BAD_REQUEST
      };
    }

    // ── 3. Validate relationshipNotes if provided ───────────────────────────
    const invalidNotes = linkedRequirementIds.filter(link => {
      if (link.relationshipNotes) {
        const notesLength = link.relationshipNotes.trim().length;
        return notesLength < descriptionLength.min || notesLength > descriptionLength.max;
      }
      return false;
    });

    if (invalidNotes.length > 0) {
      logWithTime(`❌ [linkRequirementService] Invalid relationshipNotes: must be between ${descriptionLength.min}-${descriptionLength.max} characters`);
      return {
        success: false,
        message: `relationshipNotes must be between ${descriptionLength.min}-${descriptionLength.max} characters`,
        errorCode: BAD_REQUEST
      };
    }

    // ── 4. Check for self-linking ───────────────────────────────────────────
    const sourceIdStr = String(requirementId);
    const hasSelfLink = linkedRequirementIds.some(
      link => String(link.requirementId) === sourceIdStr
    );

    if (hasSelfLink) {
      logWithTime(`❌ [linkRequirementService] Self-linking detected for ${requirementId}`);
      return {
        success: false,
        message: "A requirement cannot be linked to itself",
        errorCode: BAD_REQUEST
      };
    }

    // ── 5. Fetch source requirement ──────────────────────────────────────────
    const sourceRequirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    // ── 6. Fetch all target requirements (DB resource check) ─────────────────
    const targetIds = linkedRequirementIds.map(link => link.requirementId);
    const targetRequirements = await RequirementModel.find(
      { _id: { $in: targetIds }, isDeleted: false },
      { _id: 1 }
    ).lean();

    const foundIds = new Set(targetRequirements.map(r => String(r._id)));
    const missingIds = targetIds.filter(id => !foundIds.has(String(id)));

    if (missingIds.length > 0) {
      logWithTime(`❌ [linkRequirementService] DB resource not found: ${missingIds.join(", ")}`);
      return {
        success: false,
        message: `Linked requirement(s) do not exist: ${missingIds.join(", ")}`,
        errorCode: NOT_FOUND
      };
    }

    // ── 7. Circular dependency detection ────────────────────────────────────
    const circularLinkDetected = await detectCircularRequirementLink({
      sourceId: requirementId,
      targetIds
    });

    if (circularLinkDetected) {
      logWithTime(`❌ [linkRequirementService] Circular dependency detected for ${requirementId}`);
      return {
        success: false,
        message: "Linking these requirements would create a circular reference",
        errorCode: BAD_REQUEST
      };
    }

    // ── 8. Prepare linked requirements to add ────────────────────────────────
    const existingLinkedIds = new Set(
      sourceRequirement.linkedRequirements.map(link => String(link.requirementId))
    );

    const newLinkedRequirements = linkedRequirementIds.filter(
      link => !existingLinkedIds.has(String(link.requirementId))
    );

    if (newLinkedRequirements.length === 0) {
      logWithTime(`ℹ️ [linkRequirementService] All links already exist for ${requirementId}`);
      return {
        success: true,
        message: "All links already exist",
        requirement: sourceRequirement
      };
    }

    // ── 9. Update requirement with new links ────────────────────────────────
    sourceRequirement.linkedRequirements = [
      ...sourceRequirement.linkedRequirements,
      ...newLinkedRequirements.map(link => ({
        requirementId: new mongoose.Types.ObjectId(link.requirementId),
        relationType: link.relationType,
        relationshipNotes: link.relationshipNotes || null,
        createdBy: linkedBy
      }))
    ];

    sourceRequirement.updatedBy = linkedBy;
    const updatedRequirement = await sourceRequirement.save();

    logWithTime(`✅ [linkRequirementService] Requirement ${requirementId} linked successfully`);

    // ── 10. Log activity tracker event ──────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const linkedCount = newLinkedRequirements.length;

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REQUIREMENT_LINKED,
      `Requirement linked to ${linkedCount} other requirement(s)`,
      {
        newData: updatedRequirement.toObject(),
        adminActions: { targetId: updatedRequirement._id.toString() }
      }
    );

    manualVersionControlService({
      projectId: sourceRequirement.projectId,
      currentPhase: Phases.ELABORATION,
      action: `Requirement linked to ${linkedCount} other requirement(s)`,
      performedBy: linkedBy,
      auditContext
    })

    return { success: true, requirement: updatedRequirement };

  } catch (error) {
    logWithTime(`❌ [linkRequirementService] Error: ${error.message}`);
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
      message: "Error while linking requirement",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { linkRequirementService };
