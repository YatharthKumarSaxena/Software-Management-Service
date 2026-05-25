// services/elaborations/create-elaboration.service.js

const { ProjectModel } = require("@models/project.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { Phases } = require("@configs/enums.config");
const { createPhaseWithVersionManagement } = require("@services/common/phase-management.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Creates a new elaboration document in the database.
 *
 * @param {Object} params
 * @param {string} params.projectId              - Project MongoDB ObjectId
 * @param {boolean} [params.allowParallelMeetings] - Allow parallel meetings (default: false)
 * @param {string} params.createdBy              - Admin USR ID
 * @param {Object} params.auditContext           - { user, device, requestId }
 *
 * @returns {{ success: true, elaboration } | { success: false, message, errorCode }}
 */
const createElaborationService = async ({
  projectId,
  allowParallelMeetings,
  createdBy,
  auditContext
}) => {
  try {
    // ── Step 1: Verify project exists ──────────────────────────────────
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      logWithTime(`❌ [createElaborationService] Project not found: ${projectId}`);
      return { success: false, message: "Project not found", errorCode: NOT_FOUND };
    }

    // ── Step 2: Check if elaboration already exists ───────────────────
    const existingElaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false
    });

    if (existingElaboration) {
      logWithTime(`❌ [createElaborationService] Elaboration already exists for project ${projectId}`);
      return { success: false, message: "An active elaboration already exists for this project", errorCode: CONFLICT };
    }

    // ── Step 3: Update project's currentPhase to ELABORATION ─────────
    logWithTime(`[createElaborationService] Updating project phase to ELABORATION for ${projectId}`);

    // ── Step 4: Create phase WITH version management AND additional data ─
    logWithTime(`[createElaborationService] Creating ELABORATION phase document`);
    
    const phaseResult = await createPhaseWithVersionManagement({
      project,
      targetPhase: Phases.ELABORATION,
      createdBy,
      auditContext,
      additionalData: { 
        allowParallelMeetings: allowParallelMeetings || false
      }
    });

    if (!phaseResult.success) {
      logWithTime(`❌ [createElaborationService] Failed to create phase: ${phaseResult.message}`);
      
      return {
        success: false,
        message: phaseResult.message,
        errorCode: phaseResult.errorCode || INTERNAL_ERROR
      };
    }

    logWithTime(`✅ [createElaborationService] Elaboration created with ID: ${phaseResult.phase._id}`);
    
    return { success: true, elaboration: phaseResult.phase };

  } catch (error) {
    logWithTime(`❌ [createElaborationService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while creating elaboration", error: error.message };
  }
};

module.exports = { createElaborationService };
