// services/elaborations/freeze-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeElaborationService = async ({
  projectId,
  frozenBy,
  auditContext,
}) => {
  try {

    // Check elaboration exists and is not already frozen
    const elaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false
    });
    if (!elaboration) {
      return {
        success: false,
        message: "Elaboration not found",
        errorCode: NOT_FOUND,
      };
    }

    // Freeze elaboration
    elaboration.isFrozen = true;
    elaboration.frozenAt = new Date();
    elaboration.frozenBy = frozenBy;

    await elaboration.save();

    // ── Remove phase from project currentPhase array  ────────────────
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { currentPhase: Phases.ELABORATION } },
      { new: true }
    );

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.FREEZE_ELABORATION,
      `Elaboration frozen - version ${elaboration.version.major}.${elaboration.version.minor}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Elaboration frozen successfully",
      elaboration,
    };
  } catch (error) {
    console.error("[freezeElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to freeze elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { freezeElaborationService };
