// services/validations/freeze-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeValidationService = async ({
  projectId,
  frozenBy,
  auditContext,
}) => {
  try {

    // Check validation exists and is not already frozen
    const validation = await ValidationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false
    });
    if (!validation) {
      return {
        success: false,
        message: "Validation not found",
        errorCode: NOT_FOUND,
      };
    }

    // Freeze validation
    validation.isFrozen = true;
    validation.frozenAt = new Date();
    validation.frozenBy = frozenBy;

    await validation.save();

    // ── Remove phase from project currentPhase array  ────────────────
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { currentPhase: Phases.VALIDATION } },
      { new: true }
    );

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.FREEZE_VALIDATION,
      `Validation frozen - version ${validation.version.major}.${validation.version.minor}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Validation frozen successfully",
      validation,
    };
  } catch (error) {
    console.error("[freezeValidationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to freeze validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { freezeValidationService };
