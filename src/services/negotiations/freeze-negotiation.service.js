// services/negotiations/freeze-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const { Phases } = require("@configs/enums.config");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeNegotiationService = async ({
  projectId,
  frozenBy,
  auditContext,
}) => {
  try {

    // Check negotiation exists and is not already frozen
    const negotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false
    });
    if (!negotiation) {
      return {
        success: false,
        message: "Negotiation not found",
        errorCode: NOT_FOUND,
      };
    }

    // Freeze negotiation
    negotiation.isFrozen = true;
    negotiation.frozenAt = new Date();
    negotiation.frozenBy = frozenBy;

    await negotiation.save();

    // ── Remove phase from project currentPhase array  ────────────────
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { currentPhase: Phases.NEGOTIATION } },
      { new: true }
    );

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.FREEZE_NEGOTIATION,
      `Negotiation frozen - version ${negotiation.version.major}.${negotiation.version.minor}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Negotiation frozen successfully",
      negotiation,
    };
  } catch (error) {
    console.error("[freezeNegotiationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to freeze negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { freezeNegotiationService };
