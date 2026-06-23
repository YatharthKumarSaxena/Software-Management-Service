// services/negotiations/create-negotiation.service.js

const { ProjectModel } = require("@models/project.model");
const { Phases, WorkflowModes, PhaseStatus } = require("@configs/enums.config");
const { createPhaseWithVersionManagement } = require("@services/common/phase-management.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Creates a new negotiation document in the database.
 *
 * @param {Object} params
 * @param {string} params.projectId                    - Project MongoDB ObjectId
 * @param {string} [params.workflowMode]               - Workflow mode (OPEN | MODERATION | STRICT | CREATED_IN_MODE, default: OPEN)
 * @param {boolean} [params.allowParallelMeetings]     - Allow parallel meetings (default: false)
 * @param {string} params.createdBy                    - Admin USR ID
 * @param {Object} params.auditContext                 - { user, device, requestId }
 *
 * @returns {{ success: true, negotiation } | { success: false, message, errorCode }}
 */
const createNegotiationService = async ({
  projectId,
  allowParallelMeetings,
  workflowMode,
  phaseStatus,
  createdBy,
  auditContext
}) => {
  try {
    // ── Step 1: Verify project exists ──────────────────────────────────
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      logWithTime(`❌ [createNegotiationService] Project not found: ${projectId}`);
      return { success: false, message: "Project not found", errorCode: NOT_FOUND };
    }

    // ── Step 2: Create phase with common validation/version management ─
    logWithTime(`[createNegotiationService] Creating NEGOTIATION phase document`);
    
    const phaseResult = await createPhaseWithVersionManagement({
      project,
      targetPhase: Phases.NEGOTIATION,
      createdBy,
      auditContext,
      additionalData: { 
        workflowMode: workflowMode ?? WorkflowModes.OPEN,
        allowParallelMeetings: allowParallelMeetings ?? false,
        phaseStatus: phaseStatus ?? PhaseStatus.OPEN
      }
    });

    if (!phaseResult.success) {
      logWithTime(`❌ [createNegotiationService] Failed to create phase: ${phaseResult.message}`);
      
      return {
        success: false,
        message: phaseResult.message,
        errorCode: phaseResult.errorCode || INTERNAL_ERROR
      };
    }

    logWithTime(`✅ [createNegotiationService] Negotiation created with ID: ${phaseResult.phase._id}`);
    
    return { success: true, negotiation: phaseResult.phase };

  } catch (error) {
    logWithTime(`❌ [createNegotiationService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message, errorCode: 400 };
    }
    return { success: false, message: "Internal error while creating negotiation", error: error.message, errorCode: INTERNAL_ERROR };
  }
};

module.exports = { createNegotiationService };
