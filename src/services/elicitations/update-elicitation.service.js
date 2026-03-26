// services/elicitations/update-elicitation.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Updates an elicitation record with provided data.
 * 
 * Protected fields (cannot be updated): _id, projectId, isDeleted, deletedAt, deletedBy, createdBy
 *
 * @param {Object} params
 * @param {string} params.elicitationId - Elicitation ID
 * @param {string} params.projectId     - Project ID
 * @param {Object} params.updateData    - Fields to update
 * @param {string} params.updatedBy     - Admin ID who updated
 * @param {Object} params.auditContext  - Audit context {user, device, requestId}
 *
 * @returns {Object} { errorCode, success: true, data } | { errorCode, success: false, message }
 */
const updateElicitationService = async ({
  elicitationId,
  projectId,
  updateData,
  updatedBy,
  auditContext
}) => {
  try {

    // ── 1. Fetch the current elicitation ─────────────────────────────
    const oldElicitation = await ElicitationModel.findById(elicitationId);

    if (!oldElicitation) {
      logWithTime(`❌ [updateElicitationService] Elicitation not found: ${elicitationId}`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Elicitation not found"
      };
    }

    // ── 2. Verify it belongs to the project ──────────────────────────
    if (oldElicitation.projectId.toString() !== projectId.toString()) {
      logWithTime(`❌ [updateElicitationService] Elicitation does not belong to project ${projectId}`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Elicitation does not belong to the specified project"
      };
    }

    // ── 3. Protect sensitive fields from updates ─────────────────────
    const protectedFields = ['_id', 'projectId', 'isDeleted', 'deletedAt', 'deletedBy', 'createdBy', 'createdAt'];
    const sanitizedUpdateData = { ...updateData };
    
    protectedFields.forEach(field => {
      if (field in sanitizedUpdateData) {
        logWithTime(`⚠️ [updateElicitationService] Attempted to update protected field: ${field}`);
        delete sanitizedUpdateData[field];
      }
    });

    // ── 4. Set updatedBy and updatedAt ───────────────────────────────
    sanitizedUpdateData.updatedBy = updatedBy;
    sanitizedUpdateData.updatedAt = new Date();

    // ── 5. Update the elicitation ────────────────────────────────────
    const updatedElicitation = await ElicitationModel.findByIdAndUpdate(
      elicitationId,
      sanitizedUpdateData,
      { new: true, runValidators: true }
    );

    // ── 6. Fire-and-forget: activity tracking ────────────────────────
    const { user, device, requestId } = auditContext || {};
    
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_ELICITATION,
      `Elicitation (${elicitationId}) updated in Project ${projectId}`,
      { oldData: oldElicitation, newData: updatedElicitation }
    );

    logWithTime(`✅ [updateElicitationService] Elicitation updated successfully: ${elicitationId}`);
    return {
      errorCode: OK,
      success: true,
      data: { elicitation: updatedElicitation }
    };

  } catch (error) {
    logWithTime(`❌ [updateElicitationService] Error: ${error.message}`);
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
      message: "Internal error while updating elicitation"
    };
  }
};

module.exports = { updateElicitationService };
