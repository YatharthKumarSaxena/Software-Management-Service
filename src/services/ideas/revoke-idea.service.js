// services/ideas/revoke-idea.service.js

const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses, PriorityLevels } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");

/**
 * Revokes an idea (changes status from ACCEPTED to REVOKED).
 * Requires reason type and optional/mandatory reason description.
 * Reason description is MANDATORY if project criticality is HIGH, otherwise OPTIONAL.
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 * @param {Object} params
 * @param {string} params.revokeReasonType - Reason type from RevokeIdeaReasonTypes enum
 * @param {string} params.revokeReasonDescription - Detailed reason for revocation
 * @param {string} params.revokedBy - User ID who revoked
 * @param {string} params.projectCriticality - Project criticality level (HIGH, MEDIUM, LOW, CRITICAL)
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, idea, errorCode: 200 } | { success: false, message, errorCode }
 */
const revokeIdeaService = async (
  idea,
  { revokeReasonType, revokeReasonDescription, revokedBy, projectCriticality, auditContext }
) => {
  try {
    // ── Step 1: Check if idea is in ACCEPTED status ───────────────────
    if (idea.status !== IdeaStatuses.ACCEPTED) {
      logWithTime(
        `❌ [revokeIdeaService] Cannot revoke idea (status: ${idea.status}). Only ACCEPTED ideas can be revoked.`
      );
      return {
        success: false,
        message: `Cannot revoke idea in ${idea.status} status. Only ACCEPTED ideas can be revoked.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Step 2: Validate conditional description requirement ──────────
    // If project criticality is HIGH, description is mandatory
    if (projectCriticality === PriorityLevels.HIGH) {
      if (!revokeReasonDescription || revokeReasonDescription.trim() === "") {
        logWithTime(
          `❌ [revokeIdeaService] For HIGH criticality projects, revoke reason description is mandatory`
        );
        return {
          success: false,
          message: "For HIGH criticality projects, revoke reason description is mandatory",
          errorCode: BAD_REQUEST
        };
      }
    }

    // ── Step 3: Update idea status to REVOKED ────────────────────────
    const oldIdeaData = { ...idea.toObject ? idea.toObject() : idea };
    
    const updatedIdea = await IdeaModel.findByIdAndUpdate(
      idea._id,
      {
        $set: {
          status: IdeaStatuses.REVOKED,
          revokeReasonType,
          revokeReasonDescription: revokeReasonDescription || null,
          revokedBy,
          revokedAt: new Date(),
          updatedBy: revokedBy
        }
      },
      { new: true }
    );

    if (!updatedIdea) {
      logWithTime(`❌ [revokeIdeaService] Failed to revoke idea ${idea._id}`);
      return {
        success: false,
        message: "Failed to revoke idea",
        errorCode: CONFLICT
      };
    }

    // ── Step 4: Log activity tracker event ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldIdeaData, updatedIdea);
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.REVOKE_IDEA,
      `Idea revoked with reason: ${revokeReasonType}`,
      { oldData, newData, adminActions: { targetId: idea._id } }
    );

    logWithTime(`✅ [revokeIdeaService] Idea revoked successfully: ${idea._id}`);
    
    return { success: true, idea: updatedIdea, errorCode: 200 };

  } catch (error) {
    logWithTime(`❌ [revokeIdeaService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { 
        success: false, 
        message: "Validation error", 
        errorCode: BAD_REQUEST,
        error: error.message 
      };
    }
    return { 
      success: false, 
      message: "Internal error while revoking idea", 
      errorCode: CONFLICT,
      error: error.message 
    };
  }
};

module.exports = { revokeIdeaService };
