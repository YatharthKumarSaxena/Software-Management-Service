// services/validations/create-validation.service.js

const { ProjectModel } = require("@models/project.model");
const { ValidationModel } = require("@models/validation.model");
const { Phases } = require("@configs/enums.config");
const { createPhaseWithVersionManagement } = require("@services/common/phase-management.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Creates a new validation document in the database.
 *
 * @param {Object} params
 * @param {string} params.projectId              - Project MongoDB ObjectId
 * @param {boolean} [params.allowParallelMeetings] - Allow parallel meetings (default: false)
 * @param {string} params.createdBy              - Admin USR ID
 * @param {Object} params.auditContext           - { user, device, requestId }
 *
 * @returns {{ success: true, validation } | { success: false, message, errorCode }}
 */
const createValidationService = async ({
  projectId,
  allowParallelMeetings,
  createdBy,
  auditContext
}) => {
  try {
    // ── Step 1: Verify project exists ──────────────────────────────────
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      logWithTime(`❌ [createValidationService] Project not found: ${projectId}`);
      return { success: false, message: "Project not found", errorCode: NOT_FOUND };
    }

    // ── Step 2: Check if validation already exists ───────────────────
    const existingValidation = await ValidationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false
    });

    if (existingValidation) {
      logWithTime(`❌ [createValidationService] Validation already exists for project ${projectId}`);
      return { success: false, message: "An active validation already exists for this project", errorCode: CONFLICT };
    }

    // ── Step 3: Update project's currentPhase to VALIDATION ─────────
    logWithTime(`[createValidationService] Updating project phase to VALIDATION for ${projectId}`);

    // ── Step 4: Create phase WITH version management AND additional data ─
    logWithTime(`[createValidationService] Creating VALIDATION phase document`);
    
    const phaseResult = await createPhaseWithVersionManagement({
      project,
      targetPhase: Phases.VALIDATION,
      createdBy,
      auditContext,
      additionalData: { 
        allowParallelMeetings: allowParallelMeetings || false
      }
    });

    if (!phaseResult.success) {
      logWithTime(`❌ [createValidationService] Failed to create phase: ${phaseResult.message}`);
      
      return {
        success: false,
        message: phaseResult.message,
        errorCode: phaseResult.errorCode || INTERNAL_ERROR
      };
    }

    logWithTime(`✅ [createValidationService] Validation created with ID: ${phaseResult.phase._id}`);
    
    return { success: true, validation: phaseResult.phase };

  } catch (error) {
    logWithTime(`❌ [createValidationService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while creating validation", error: error.message };
  }
};

module.exports = { createValidationService };
