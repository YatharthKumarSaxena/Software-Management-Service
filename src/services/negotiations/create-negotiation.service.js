// services/negotiations/create-negotiation.service.js

const { ProjectModel } = require("@models/project.model");
const { NegotiationModel } = require("@models/negotiation.model");
const { Phases } = require("@configs/enums.config");
const { createPhaseWithVersionManagement } = require("@services/common/phase-management.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Creates a new negotiation document in the database.
 *
 * @param {Object} params
 * @param {string} params.projectId              - Project MongoDB ObjectId
 * @param {boolean} [params.allowParallelMeetings] - Allow parallel meetings (default: false)
 * @param {string} params.createdBy              - Admin USR ID
 * @param {Object} params.auditContext           - { user, device, requestId }
 *
 * @returns {{ success: true, negotiation } | { success: false, message, errorCode }}
 */
const createNegotiationService = async ({
  projectId,
  allowParallelMeetings,
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

    // ── Step 2: Check if negotiation already exists ───────────────────
    const existingNegotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false
    });

    if (existingNegotiation) {
      logWithTime(`❌ [createNegotiationService] Negotiation already exists for project ${projectId}`);
      return { success: false, message: "An active negotiation already exists for this project", errorCode: CONFLICT };
    }

    // ── Step 3: Update project's currentPhase to NEGOTIATION ─────────
    logWithTime(`[createNegotiationService] Updating project phase to NEGOTIATION for ${projectId}`);
    
    const oldProjectData = { ...project.toObject ? project.toObject() : project };
    
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      projectId,
      {
        $addToSet: { currentPhase: Phases.NEGOTIATION }
      },
      { new: true }
    );

    if (!updatedProject) {
      logWithTime(`❌ [createNegotiationService] Failed to update project phase`);
      return { success: false, message: "Failed to update project phase", errorCode: INTERNAL_ERROR };
    }

    // ── Step 4: Create phase WITH version management AND additional data ─
    logWithTime(`[createNegotiationService] Creating NEGOTIATION phase document`);
    
    const phaseResult = await createPhaseWithVersionManagement({
      project: updatedProject,
      createdBy,
      auditContext,
      additionalData: { 
        allowParallelMeetings: allowParallelMeetings || false
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
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while creating negotiation", error: error.message };
  }
};

module.exports = { createNegotiationService };
