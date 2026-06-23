// services/specifications/create-specification.service.js

const { ProjectModel } = require("@models/project.model");
const { Phases, PhaseStatus } = require("@configs/enums.config");
const { createPhaseWithVersionManagement } = require("@services/common/phase-management.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Creates a new specification document in the database.
 *
 * @param {Object} params
 * @param {string} params.projectId              - Project MongoDB ObjectId
 * @param {boolean} [params.allowParallelMeetings] - Allow parallel meetings (default: false)
 * @param {string} params.createdBy              - Admin USR ID
 * @param {Object} params.auditContext           - { user, device, requestId }
 *
 * @returns {{ success: true, specification } | { success: false, message, errorCode }}
 */
const createSpecificationService = async ({
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
      logWithTime(`❌ [createSpecificationService] Project not found: ${projectId}`);
      return { success: false, message: "Project not found", errorCode: NOT_FOUND };
    }

    // ── Step 2: Create phase with common validation/version management ─
    logWithTime(`[createSpecificationService] Creating SPECIFICATION phase document`);
    
    const phaseResult = await createPhaseWithVersionManagement({
      project,
      targetPhase: Phases.SPECIFICATION,
      createdBy,
      auditContext,
      additionalData: { 
        allowParallelMeetings: allowParallelMeetings ?? false,
        ...(workflowMode !== undefined && workflowMode !== null && { workflowMode }),
        phaseStatus: phaseStatus ?? PhaseStatus.OPEN
      }
    });

    if (!phaseResult.success) {
      logWithTime(`❌ [createSpecificationService] Failed to create phase: ${phaseResult.message}`);
      
      return {
        success: false,
        message: phaseResult.message,
        errorCode: phaseResult.errorCode || INTERNAL_ERROR
      };
    }

    logWithTime(`✅ [createSpecificationService] Specification created with ID: ${phaseResult.phase._id}`);
    
    return { success: true, specification: phaseResult.phase };

  } catch (error) {
    logWithTime(`❌ [createSpecificationService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message, errorCode: 400 };
    }
    return { success: false, message: "Internal error while creating specification", error: error.message, errorCode: INTERNAL_ERROR };
  }
};

module.exports = { createSpecificationService };
