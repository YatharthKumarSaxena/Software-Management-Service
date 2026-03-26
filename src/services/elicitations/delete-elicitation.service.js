// services/elicitations/delete-elicitation.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { PriorityLevels, PhaseDeletionReason } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Soft-deletes an elicitation record.
 * 
 * Required: deletionReasonType
 * If project.criticality = HIGH, deletionReasonDescription is also required.
 *
 * @param {Object} params
 * @param {string} params.elicitationId    - Elicitation ID
 * @param {string} params.projectId        - Project ID
 * @param {string} params.projectCriticality - Project criticality level
 * @param {string} params.deletionReasonType - Reason for deletion (enum)
 * @param {string} [params.deletionReasonDescription] - Description of deletion reason
 * @param {string} params.deletedBy        - Admin ID who deleted
 * @param {Object} params.auditContext     - Audit context {user, device, requestId}
 *
 * @returns {Object} { errorCode, success: true, data } | { errorCode, success: false, message }
 */
const deleteElicitationService = async ({
  elicitationId,
  projectId,
  projectCriticality,
  deletionReasonType,
  deletionReasonDescription,
  deletedBy,
  auditContext
}) => {
  try {

    // ── 1. Validate deletionReasonType ───────────────────────────────
    if (!deletionReasonType) {
      logWithTime(`❌ [deleteElicitationService] Missing deletionReasonType`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "deletionReasonType is required"
      };
    }

    // ── 2. Check if deletionReasonType is valid ──────────────────────
    const validReasons = Object.values(PhaseDeletionReason);
    if (!validReasons.includes(deletionReasonType)) {
      logWithTime(`❌ [deleteElicitationService] Invalid deletionReasonType: ${deletionReasonType}`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: `Invalid deletionReasonType. Must be one of: ${validReasons.join(", ")}`
      };
    }

    // ── 3. If project criticality is HIGH, description is required ───
    if (projectCriticality === PriorityLevels.HIGH) {
      if (!deletionReasonDescription || deletionReasonDescription.trim().length === 0) {
        logWithTime(`❌ [deleteElicitationService] Missing deletionReasonDescription for HIGH criticality project`);
        return {
          errorCode: BAD_REQUEST,
          success: false,
          message: "deletionReasonDescription is required for HIGH criticality projects"
        };
      }
    }

    // ── 4. Soft-delete the elicitation ───────────────────────────────
    const oldElicitation = await ElicitationModel.findById(elicitationId);

    const updatedElicitation = await ElicitationModel.findByIdAndUpdate(
      elicitationId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        deletionReasonType,
        deletionReasonDescription: deletionReasonDescription || null
      },
      { new: true }
    );

    if (!updatedElicitation) {
      logWithTime(`❌ [deleteElicitationService] Elicitation not found: ${elicitationId}`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Elicitation not found"
      };
    }

    // ── 5. Fire-and-forget: activity tracking ────────────────────────
    const { user, device, requestId } = auditContext || {};
    
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_ELICITATION,
      `Elicitation (${elicitationId}) soft-deleted from Project ${projectId}. Reason: ${deletionReasonType}`,
      { oldData: oldElicitation, newData: updatedElicitation }
    );

    logWithTime(`✅ [deleteElicitationService] Elicitation soft-deleted successfully: ${elicitationId}`);
    return {
      errorCode: OK,
      success: true,
      data: { elicitation: updatedElicitation }
    };

  } catch (error) {
    logWithTime(`❌ [deleteElicitationService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Validation error: " + error.message
      };
    }
    return {
      errorCode: INTERNAL_ERROR,
      success: false,
      message: "Internal error while deleting elicitation"
    };
  }
};

module.exports = { deleteElicitationService };
