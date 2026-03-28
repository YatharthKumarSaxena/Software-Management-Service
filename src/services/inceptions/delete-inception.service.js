// services/inceptions/delete-inception.service.js

const { InceptionModel } = require("@models/inception.model");
const { ProjectTypes, ProjectStatus, PriorityLevels } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");

/**
 * Soft-deletes an inception (sets isDeleted = true).
 *
 * Logic:
 *   1. Check if a frozen inception exists for this project
 *   2. If frozen inception EXISTS → allow deletion ✅
 *   3. If frozen inception DOES NOT EXIST:
 *      - If project type is DEVELOPMENT → block deletion ❌
 *      - If project type is NOT DEVELOPMENT → allow deletion ✅
 *   4. Validate criticality & description
 *
 * @param {Object} inception - Inception to delete (latest non-frozen)
 * @param {string} inception._id
 * @param {string} inception.projectId
 * @param {Object} params
 * @param {Object} params.project - Project document
 * @param {string} params.deletedBy - Admin USR ID
 * @param {string} params.deletionReasonType - Enum reason for deletion
 * @param {string} [params.deletionReasonDescription] - Optional description
 * @param {Object} [params.auditContext] - For activity tracking
 *
 * @returns {{ success: true } | { success: false, message }}
 */
const deleteInceptionService = async (inception, params) => {
  try {
    const { project, deletedBy, deletionReasonType, deletionReasonDescription, auditContext } = params;
    
    // ── 1. Check project status ────────────────────────────────────────
    if (project.projectStatus !== ProjectStatus.ACTIVE && project.projectStatus !== ProjectStatus.DRAFT) {
      return {
        success: false,
        message: "Inception cannot be deleted for projects that are not in ACTIVE or DRAFT status."
      };
    }

    // ── 2. Check if FROZEN inception exists for this project ──────────
    const frozenInception = await InceptionModel.findOne({
      projectId: project._id,
      isFrozen: true,
      isDeleted: false
    }).lean();

    // ── 3. Guard: If NO frozen inception AND project type is DEVELOPMENT ──
    // (Only block if no frozen doc exists)
    if (!frozenInception && project.projectType === ProjectTypes.DEVELOPMENT) {
      return {
        success: false,
        message: "Inception cannot be deleted for Project Development type."
      };
    }

    // ── 4. Check criticality and description ────────────────────────
    if (project.projectCriticality === PriorityLevels.CRITICAL && !deletionReasonDescription) {
      return {
        success: false,
        message: "Inception cannot be deleted for high-criticality projects without a reason description."
      };
    }

    // ── 5. Soft-delete the inception ────────────────────────────────
    const updatePayload = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
      deletionReasonType,
      deletionReasonDescription: deletionReasonDescription || null
    };

    const updatedInception = await InceptionModel.findByIdAndUpdate(
      inception._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── 6. Activity tracking ────────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(inception, updatedInception);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_INCEPTION,
      `Inception (${inception._id}) soft-deleted by ${deletedBy}. Reason: ${deletionReasonType}`,
      { oldData, newData, adminActions: { targetId: inception._id } }
    );

    return { success: true };
  } catch (error) {
    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        error: error.message
      };
    }
    return {
      success: false,
      message: "Internal error while deleting inception",
      error: error.message
    };
  }
};

module.exports = { deleteInceptionService };
