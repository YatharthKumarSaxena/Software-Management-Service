// services/elicitations/create-elicitation.service.js

const mongoose = require("mongoose");
const { ElicitationModel } = require("@models/elicitation.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ElicitationModes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CREATED, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Creates a new empty elicitation document in the database.
 * 
 * Only Admins who are stakeholders of the project can create elicitations.
 *
 * @param {Object} params
 * @param {string} params.projectId        - Project ID (MongoDB ObjectId)
 * @param {string} params.createdBy        - Admin ID who created the elicitation
 * @param {Object} params.auditContext     - Audit context {user, device, requestId}
 *
 * @returns {Object} { errorCode, success: true, data } | { errorCode, success: false, message }
 */
const createElicitationService = async ({
  projectId,
  createdBy,
  auditContext
}) => {
  try {

    // ── 1. Validate projectId ────────────────────────────────────────
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      logWithTime(`❌ [createElicitationService] Invalid projectId: ${projectId}`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Invalid projectId format"
      };
    }

    // ── 2. Validate createdBy ────────────────────────────────────────
    if (!createdBy) {
      logWithTime(`❌ [createElicitationService] Missing createdBy`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "createdBy is required"
      };
    }

    // ── 3. Generate elicitationId ────────────────────────────────────
    const elicitationId = new mongoose.Types.ObjectId();

    // ── 4. Create the elicitation (empty - no title, no description) ──
    const elicitation = await ElicitationModel.create({
      _id: elicitationId,
      projectId: new mongoose.Types.ObjectId(projectId),
      createdBy,
      title: null,
      description: null,
      isFrozen: false,
      elicitationMode: ElicitationModes.OPEN,
      isDeleted: false,
      participants: []
    });

    // ── 5. Fire-and-forget: activity tracking ────────────────────────
    const { user, device, requestId } = auditContext || {};
    
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_ELICITATION,
      `Elicitation (${elicitation._id}) created for Project ${projectId}`,
      { oldData: null, newData: elicitation }
    );

    logWithTime(`✅ [createElicitationService] Elicitation created successfully: ${elicitation._id}`);
    return {
      errorCode: CREATED,
      success: true,
      data: { elicitation }
    };

  } catch (error) {
    logWithTime(`❌ [createElicitationService] Error: ${error.message}`);
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
      message: "Internal error while creating elicitation"
    };
  }
};

module.exports = { createElicitationService };
