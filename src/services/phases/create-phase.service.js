// services/phases/create-phase.service.js

const mongoose = require("mongoose");

const { ProjectModel } = require("@models/project.model");

const {
  Phases,
  WorkflowModes,
  PhaseStatus
} = require("@configs/enums.config");

const {
  createPhaseWithVersionManagement
} = require("@services/common/phase-management.service");

const {
  logWithTime
} = require("@utils/time-stamps.util");

const {
  NOT_FOUND,
  BAD_REQUEST,
  INTERNAL_ERROR
} = require("@configs/http-status.config");

/**
 * Generic Create Phase Service
 *
 * Supported:
 *  - INCEPTION
 *  - ELICITATION
 *  - ELABORATION
 *  - NEGOTIATION
 *  - SPECIFICATION
 *  - VALIDATION
 */
const createPhaseService = async ({
  projectId,
  phaseType,
  allowParallelMeetings,
  workflowMode,
  phaseStatus,
  createdBy,
  auditContext
}) => {

  try {

    // -------------------------
    // Validate Phase Type
    // -------------------------
    if (!Object.values(Phases).includes(phaseType)) {

      logWithTime(
        `❌ [createPhaseService] Invalid phase type: ${phaseType}`
      );

      return {
        success: false,
        message: "Invalid phase type",
        errorCode: BAD_REQUEST
      };
    }

    // -------------------------
    // Validate Project
    // -------------------------
    const project = await ProjectModel.findById(projectId);

    if (!project) {

      logWithTime(
        `❌ [createPhaseService] Project not found: ${projectId}`
      );

      return {
        success: false,
        message: "Project not found",
        errorCode: NOT_FOUND
      };
    }

    // -------------------------
    // Ensure Model Exists
    // -------------------------
    try {
      mongoose.model(phaseType);
    } catch {

      logWithTime(
        `❌ [createPhaseService] Mongoose model not registered for ${phaseType}`
      );

      return {
        success: false,
        message: "Phase model not registered",
        errorCode: INTERNAL_ERROR
      };
    }

    // -------------------------
    // Create Phase
    // -------------------------
    logWithTime(
      `[createPhaseService] Creating ${phaseType} phase for project ${projectId}`
    );

    const phaseResult =
      await createPhaseWithVersionManagement({

        project,

        targetPhase: phaseType,

        createdBy,

        auditContext,

        additionalData: {

          workflowMode:
            workflowMode ??
            WorkflowModes.OPEN,

          allowParallelMeetings:
            allowParallelMeetings ??
            false,

          phaseStatus:
            phaseStatus ??
            PhaseStatus.OPEN
        }
      });

    if (!phaseResult.success) {

      logWithTime(
        `❌ [createPhaseService] Failed: ${phaseResult.message}`
      );

      return {
        success: false,
        message: phaseResult.message,
        errorCode:
          phaseResult.errorCode ??
          INTERNAL_ERROR
      };
    }

    logWithTime(
      `✅ [createPhaseService] Created ${phaseType} : ${phaseResult.phase._id}`
    );

    return {
      success: true,
      phase: phaseResult,
      message: `New Cycle of ${phaseType} phase created successfully`
    };

  } catch (error) {

    logWithTime(
      `❌ [createPhaseService] ${error.message}`
    );

    if (error.name === "ValidationError") {

      return {
        success: false,
        message: "Validation error",
        error: error.message,
        errorCode: BAD_REQUEST
      };
    }

    return {
      success: false,
      message: "Internal error while creating phase",
      error: error.message,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = {
  createPhaseService
};
