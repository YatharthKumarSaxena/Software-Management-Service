// services/inceptions/delete-inception.service.js

const { InceptionModel } = require("@models/inception.model");
const { ProjectModel } = require("@models/project.model");
const { ProjectTypes, ProjectStatus, PriorityLevels, Phases } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { CONFLICT, INTERNAL_ERROR, NOT_FOUND, BAD_REQUEST } = require("@configs/http-status.config");

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
    const latestInception = await InceptionModel.findOne({
      projectId: project._id,
      isDeleted: false
    }).sort({
      "version.major": -1,
      "version.minor": -1
    }).lean();

    if (!latestInception) {
      return {
        errorCode: NOT_FOUND,
        success: false,
        message: "No inception found for this project."
      };
    }

    if (latestInception.isFrozen) {
      return {
        errorCode: CONFLICT,
        success: false,
        message: "Inception cannot be deleted because a frozen inception exists for this project."
      };
    }


    if (latestInception && latestInception.version && latestInception.version.minor !== 0) {
      return {
        success: false,
        message: "Cannot delete phase. Phase has been updated and cannot be deleted.",
        errorCode: CONFLICT
      };
    }

    // ── 3. Guard: If NO frozen inception AND project type is DEVELOPMENT ──
    // (Only block if no frozen doc exists)
    if (!latestInception.isFrozen && project.projectType === ProjectTypes.DEVELOPMENT && latestInception.version.major === 1) {
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Inception cannot be deleted for Project Development type."
      };
    }

    // ── 4. Check criticality and description ────────────────────────
    if (project.projectCriticality === PriorityLevels.CRITICAL && !deletionReasonDescription) {
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Inception cannot be deleted for high-criticality projects without a reason description."
      };
    }

    // ── 6. Soft-delete the inception ────────────────────────────────
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

    // ── 7. Remove phase from project currentPhase array ────────────────
    await ProjectModel.findByIdAndUpdate(
      project._id,
      { $pull: { currentPhase: Phases.INCEPTION } },
      { new: true }
    );

    // ── 8. Activity tracking ────────────────────────────────────────
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
        error: error.message,
        errorCode: INTERNAL_ERROR
      };
    }
    return {
      success: false,
      message: "Internal error while deleting inception",
      error: error.message,
      errorCode: INTERNAL_ERROR
    };
    };
};

module.exports = { deleteInceptionService };
