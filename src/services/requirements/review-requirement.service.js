// services/requirements/review-requirement.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, FORBIDDEN, BAD_REQUEST, INTERNAL_ERROR, NOT_FOUND } = require("@configs/http-status.config");
const { RequirementStatuses, Phases, WorkflowModes, ReviewNoteEntityTypes } = require("@configs/enums.config");
const { createReviewNoteService } = require("@services/review-notes/create-review-note.service");
const { updateReviewNoteService } = require("@services/review-notes/update-review-note.service");
const { deleteReviewNoteService } = require("@services/review-notes/delete-review-note.service");
const { getReviewNotesService } = require("@services/review-notes/get-review-notes.service");
const { listReviewNotesService } = require("@services/review-notes/list-review-notes.service");

/**
 * Utility function to validate and get review requirement context
 * Checks phase availability, requirement status, and reviewer permissions
 * 
 * Works across three phases: ELICITATION, ELABORATION, NEGOTIATION
 * 
 * @param {Object} params
 * @param {string} params.requirementId - Requirement ID to review
 * @param {Object} params.project - Project object with currentPhase array
 * @param {Object} params.elicitation - Elicitation phase context
 * @param {Object} params.elaboration - Elaboration phase context
 * @param {Object} params.negotiation - Negotiation phase context
 * @param {string} [params.phase] - Specific phase to use (required if multiple phases active)
 * @param {string} params.reviewerId - User ID attempting to add review note
 * 
 * @returns {{
 *   success: true,
 *   requirement: Object,
 *   phaseContext: Object,
 *   phaseName: string,
 *   assignedPhase: string
 * } | {
 *   success: false,
 *   message: string,
 *   errorCode: number
 * }}
 */
const validateReviewRequirementContext = async ({
  requirementId,
  project,
  elicitation,
  elaboration,
  negotiation,
  phase = null,
  reviewerId
}) => {
  try {
    logWithTime(`📍 [validateReviewRequirementContext] Validating review context for requirement: ${requirementId}`);

    // ── 1. Fetch requirement ────────────────────────────────────────────────
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });

    // ── 2. Check requirement status is UNDER_REVIEW (COMPULSORY) ────────────
    if (requirement.status !== RequirementStatuses.UNDER_REVIEW) {
      logWithTime(`❌ [validateReviewRequirementContext] Requirement status must be UNDER_REVIEW. Current: ${requirement.status}`);
      return {
        success: false,
        message: `Requirement must be in UNDER_REVIEW status to add review notes. Current status: ${requirement.status}`,
        errorCode: BAD_REQUEST
      };
    }

    // ── 3. Determine active phases ──────────────────────────────────────────
    const activePhases = project.currentPhase;

    if (!activePhases || activePhases.length === 0) {
      logWithTime(`❌ [validateReviewRequirementContext] No active phases in project`);
      return {
        success: false,
        message: "Project has no active phases to review requirements",
        errorCode: CONFLICT
      };
    }

    // ── 4. Resolve which phase to use ───────────────────────────────────────
    let assignedPhase = null;

    if (activePhases.length === 1) {
      assignedPhase = activePhases[0];
    } else {
      // Multiple phases active - phase must be specified
      if (!phase) {
        logWithTime(`❌ [validateReviewRequirementContext] Multiple phases active but no phase specified`);
        return {
          success: false,
          message: "Multiple phases are active. Please specify which phase to review this requirement in (ELICITATION, ELABORATION, or NEGOTIATION)",
          errorCode: CONFLICT
        };
      }

      if (!activePhases.includes(phase)) {
        logWithTime(`❌ [validateReviewRequirementContext] Specified phase not active: ${phase}`);
        return {
          success: false,
          message: `Specified phase (${phase}) is not currently active. Active phases: ${activePhases.join(", ")}`,
          errorCode: CONFLICT
        };
      }

      assignedPhase = phase;
    }

    logWithTime(`📋 [validateReviewRequirementContext] Using phase: ${assignedPhase}`);

    // ── 5. Get phase context from enum mapping ──────────────────────────────
    const phaseContextMap = {
      [Phases.ELICITATION]: elicitation,
      [Phases.ELABORATION]: elaboration,
      [Phases.NEGOTIATION]: negotiation
    };

    const phaseContext = phaseContextMap[assignedPhase];

    if (!phaseContext) {
      logWithTime(`❌ [validateReviewRequirementContext] Phase context missing for ${assignedPhase}`);
      return {
        success: false,
        message: `Phase context not provided for ${assignedPhase}. Cannot validate review permissions.`,
        errorCode: CONFLICT
      };
    }

    // ── 6. Validate reviewer permissions based on workflow mode ──────────────
    if (requirement.createdInMode === WorkflowModes.MODERATION) {
      logWithTime(`📍 [validateReviewRequirementContext] Requirement in MODERATION mode - checking reviewer permissions`);

      // In MODERATION mode, user must be a reviewer/approver for this phase
      const reviewers = phaseContext.reviewers || [];

      if (!reviewers.includes(reviewerId)) {
        logWithTime(`❌ [validateReviewRequirementContext] User ${reviewerId} is not a reviewer for ${assignedPhase}`);
        return {
          success: false,
          message: `You are not authorized to review requirements in ${assignedPhase} phase. User must be a reviewer or approver.`,
          errorCode: FORBIDDEN
        };
      }

      logWithTime(`✅ [validateReviewRequirementContext] User ${reviewerId} authorized as reviewer/approver`);
    } else {
      logWithTime(`📍 [validateReviewRequirementContext] Requirement in OPEN mode - no reviewer validation needed`);
    }

    // ── 8. Return validation success with all necessary context ─────────────
    logWithTime(`✅ [validateReviewRequirementContext] Validation successful for phase: ${assignedPhase}`);

    return {
      success: true,
      requirement,
      phaseContext,
      phaseName: assignedPhase,
      assignedPhase
    };

  } catch (error) {
    logWithTime(`❌ [validateReviewRequirementContext] Error: ${error.message}`);
    return {
      success: false,
      message: "Error validating review requirement context",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

/**
 * Creates a review note on a requirement
 * 
 * Combines validation and review note creation:
 * 1. Validates requirement context using validateReviewRequirementContext
 * 2. Creates review note using createReviewNoteService
 * 
 * @param {Object} params
 * @param {string} params.requirementId - Requirement ID to review
 * @param {Object} params.project - Project object with currentPhase array
 * @param {Object} params.elicitation - Elicitation phase context
 * @param {Object} params.elaboration - Elaboration phase context
 * @param {Object} params.negotiation - Negotiation phase context
 * @param {string} [params.phase] - Specific phase to use (required if multiple phases active)
 * @param {string} params.reviewerId - User ID creating the review note
 * @param {string} params.description - Review note description
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, reviewNote } | { success: false, message, errorCode }}
 */
const createReviewOnRequirementService = async ({
  requirementId,
  project,
  elicitation,
  elaboration,
  negotiation,
  phase = null,
  reviewerId,
  description,
  auditContext
}) => {
  try {
    logWithTime(`📍 [createReviewOnRequirementService] Starting review creation for requirement: ${requirementId}`);

    // ── 1. Validate requirement and get phase context ────────────────────────
    const validationResult = await validateReviewRequirementContext({
      requirementId,
      project,
      elicitation,
      elaboration,
      negotiation,
      phase,
      reviewerId
    });

    if (!validationResult.success) {
      logWithTime(`❌ [createReviewOnRequirementService] Validation failed: ${validationResult.message}`);
      return {
        success: false,
        message: validationResult.message,
        errorCode: validationResult.errorCode
      };
    }

    const { requirement, phaseContext, phaseName } = validationResult;

    logWithTime(`✅ [createReviewOnRequirementService] Validation successful for requirement: ${requirementId}`);

    // ── 2. Create review note using createReviewNoteService ──────────────────
    const reviewNoteResult = await createReviewNoteService({
      targetEntityId: requirementId,
      type: ReviewNoteEntityTypes.REQUIREMENT,
      description,
      phaseContext,
      phaseName,
      reviewerId,
      auditContext
    });

    if (!reviewNoteResult.success) {
      logWithTime(`❌ [createReviewOnRequirementService] Failed to create review note: ${reviewNoteResult.message}`);
      return {
        success: false,
        message: reviewNoteResult.message,
        errorCode: reviewNoteResult.errorCode
      };
    }

    logWithTime(`✅ [createReviewOnRequirementService] Review note created successfully: ${reviewNoteResult.reviewNote._id}`);

    return {
      success: true,
      reviewNote: reviewNoteResult.reviewNote
    };

  } catch (error) {
    logWithTime(`❌ [createReviewOnRequirementService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error creating review on requirement",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

/**
 * Updates a review note on a requirement
 * 
 * Combines validation and review note update:
 * 1. Validates requirement context using validateReviewRequirementContext
 * 2. Updates review note using updateReviewNoteService
 * 
 * Permissions:
 * - Only the creator can update their own note
 * - Update allowed only within 30 minutes of creation
 * 
 * @param {Object} params
 * @param {string} params.requirementId - Requirement ID
 * @param {string} params.reviewNoteId - Review note ID to update
 * @param {Object} params.project - Project object with currentPhase array
 * @param {Object} params.elicitation - Elicitation phase context
 * @param {Object} params.elaboration - Elaboration phase context
 * @param {Object} params.negotiation - Negotiation phase context
 * @param {string} [params.phase] - Specific phase to use (required if multiple phases active)
 * @param {string} params.userId - User ID attempting update
 * @param {string} params.description - New review note description
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, reviewNote } | { success: false, message, errorCode }}
 */
const updateReviewOnRequirementService = async ({
  requirementId,
  reviewNoteId,
  project,
  elicitation,
  elaboration,
  negotiation,
  phase = null,
  userId,
  description,
  auditContext
}) => {
  try {
    logWithTime(`📍 [updateReviewOnRequirementService] Updating review on requirement: ${requirementId}, review note: ${reviewNoteId}`);

    // ── 1. Validate requirement and get phase context ────────────────────────
    const validationResult = await validateReviewRequirementContext({
      requirementId,
      project,
      elicitation,
      elaboration,
      negotiation,
      phase,
      reviewerId: userId
    });

    if (!validationResult.success) {
      logWithTime(`❌ [updateReviewOnRequirementService] Validation failed: ${validationResult.message}`);
      return {
        success: false,
        message: validationResult.message,
        errorCode: validationResult.errorCode
      };
    }

    const { phaseContext, phaseName } = validationResult;

    logWithTime(`✅ [updateReviewOnRequirementService] Validation successful for requirement: ${requirementId}`);

    // ── 2. Update review note using updateReviewNoteService ──────────────────
    const updateResult = await updateReviewNoteService({
      reviewNoteId,
      description,
      phaseContext,
      phase: phaseName,
      userId,
      auditContext
    });

    if (!updateResult.success) {
      logWithTime(`❌ [updateReviewOnRequirementService] Failed to update review note: ${updateResult.message}`);
      return {
        success: false,
        message: updateResult.message,
        errorCode: updateResult.errorCode
      };
    }

    logWithTime(`✅ [updateReviewOnRequirementService] Review note updated successfully: ${reviewNoteId}`);

    return {
      success: true,
      reviewNote: updateResult.reviewNote
    };

  } catch (error) {
    logWithTime(`❌ [updateReviewOnRequirementService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error updating review on requirement",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

/**
 * Deletes a review note on a requirement
 * 
 * Combines validation and review note deletion:
 * 1. Validates requirement context using validateReviewRequirementContext
 * 2. Deletes review note using deleteReviewNoteService
 * 
 * Permissions & Time Constraints:
 * - Creator: Can delete own note within 30 minutes of creation
 * - Other reviewers: Can delete anytime
 * 
 * @param {Object} params
 * @param {string} params.requirementId - Requirement ID
 * @param {string} params.reviewNoteId - Review note ID to delete
 * @param {Object} params.project - Project object with currentPhase array
 * @param {Object} params.elicitation - Elicitation phase context
 * @param {Object} params.elaboration - Elaboration phase context
 * @param {Object} params.negotiation - Negotiation phase context
 * @param {string} [params.phase] - Specific phase to use (required if multiple phases active)
 * @param {string} params.userId - User ID attempting deletion
 * @param {string} [params.deletionDescription] - Optional deletion description
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, reviewNote } | { success: false, message, errorCode }}
 */
const deleteReviewOnRequirementService = async ({
  requirementId,
  reviewNoteId,
  project,
  elicitation,
  elaboration,
  negotiation,
  phase = null,
  userId,
  deletionDescription,
  auditContext
}) => {
  try {
    logWithTime(`📍 [deleteReviewOnRequirementService] Deleting review on requirement: ${requirementId}, review note: ${reviewNoteId}`);

    // ── 1. Validate requirement and get phase context ────────────────────────
    const validationResult = await validateReviewRequirementContext({
      requirementId,
      project,
      elicitation,
      elaboration,
      negotiation,
      phase,
      reviewerId: userId
    });

    if (!validationResult.success) {
      logWithTime(`❌ [deleteReviewOnRequirementService] Validation failed: ${validationResult.message}`);
      return {
        success: false,
        message: validationResult.message,
        errorCode: validationResult.errorCode
      };
    }

    const { phaseContext, phaseName } = validationResult;

    logWithTime(`✅ [deleteReviewOnRequirementService] Validation successful for requirement: ${requirementId}`);

    // ── 2. Delete review note using deleteReviewNoteService ──────────────────
    const deleteResult = await deleteReviewNoteService({
      reviewNoteId,
      phaseContext,
      phase: phaseName,
      userId,
      deletionDescription,
      auditContext
    });

    if (!deleteResult.success) {
      logWithTime(`❌ [deleteReviewOnRequirementService] Failed to delete review note: ${deleteResult.message}`);
      return {
        success: false,
        message: deleteResult.message,
        errorCode: deleteResult.errorCode
      };
    }

    logWithTime(`✅ [deleteReviewOnRequirementService] Review note deleted successfully: ${reviewNoteId}`);

    return {
      success: true,
      reviewNote: deleteResult.reviewNote
    };

  } catch (error) {
    logWithTime(`❌ [deleteReviewOnRequirementService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error deleting review on requirement",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

/**
 * Lists all review notes on a requirement
 * 
 * Uses predefined listReviewNotesService from review-notes folder
 * 
 * @param {Object} params
 * @param {string} params.requirementId - Requirement ID to list review notes for
 * @param {string} params.userId - User ID requesting the list (for logging)
 * @param {number} [params.limit] - Limit number of results
 * @param {number} [params.skip] - Skip number of results for pagination
 * @param {string} [params.sortBy] - Sort field (default: "createdAt")
 * @param {number} [params.sortOrder] - Sort order 1 (asc) or -1 (desc) (default: -1)
 * 
 * @returns {{ success: true, reviewNotes: [], total: number } | { success: false, message, errorCode }}
 */
const listReviewOnRequirementService = async ({
  requirementId,
  limit = null,
  skip = 0,
  sortBy = "createdAt",
  sortOrder = -1
}) => {
  try {
    logWithTime(
      `📍 [listReviewOnRequirementService] Listing review notes for requirement: ${requirementId}`
    );

    // ── 2. Use predefined listReviewNotesService to fetch review notes ────────
    const listResult = await listReviewNotesService({
      entityId: requirementId,
      limit,
      skip,
      sortBy,
      sortOrder
    });

    if (!listResult.success) {
      logWithTime(`❌ [listReviewOnRequirementService] Failed to list review notes: ${listResult.message}`);
      return {
        success: false,
        message: listResult.message,
        errorCode: listResult.errorCode
      };
    }

    logWithTime(
      `✅ [listReviewOnRequirementService] Retrieved ${listResult.reviewNotes.length} of ${listResult.total} review note(s) for requirement: ${requirementId}`
    );

    return {
      success: true,
      reviewNotes: listResult.reviewNotes,
      total: listResult.total
    };

  } catch (error) {
    logWithTime(`❌ [listReviewOnRequirementService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error retrieving review notes",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { validateReviewRequirementContext, createReviewOnRequirementService, updateReviewOnRequirementService, deleteReviewOnRequirementService, getReviewOnRequirementService, listReviewOnRequirementService };
