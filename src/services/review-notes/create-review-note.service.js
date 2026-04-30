// services/requirements/review-notes/create-review-note.service.js

const { ReviewNoteModel, ENTITY_TYPE_TO_MODEL } = require("@models/review-note.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR, CONFLICT } = require("@configs/http-status.config");
const { ReviewNoteEntityTypes } = require("@/configs/enums.config");
const { manualVersionControlService } = require("../common/version.service");

/**
 * Creates a review note for an entity (requirement, scope, inception, high-level-feature)
 * 
 * Validates that:
 * 1. Entity type and entity ID match (entity must exist in correct collection)
 * 2. Phase context is provided and phase is not frozen
 * 3. Description is valid length
 * 
 * @param {Object} params
 * @param {string} params.targetEntityId - ID of the entity being reviewed
 * @param {string} params.type - Entity type (REQUIREMENT, SCOPE, INCEPTION, HIGH_LEVEL_FEATURE)
 * @param {string} params.description - Review note description
 * @param {Object} params.phaseContext - Phase context object with isFrozen status
 * @param {string} params.phaseName - Phase name (ELICITATION, ELABORATION, NEGOTIATION) - for logging
 * @param {string} params.reviewerId - User ID creating the review note
 * @param {Object} [params.auditContext] - { user, device, requestId }
 * 
 * @returns {{ success: true, reviewNote } | { success: false, message, errorCode }}
 */
const createReviewNoteService = async ({
  targetEntityId,
  type = ReviewNoteEntityTypes.REQUIREMENT,
  description,
  phaseContext,
  phaseName,
  reviewerId,
  auditContext
}) => {
  try {
    logWithTime(
      `📍 [createReviewNoteService] Creating review note for entity: ${targetEntityId}, type: ${type}`
    );

    // ── 3. Get model for entity type and fetch entity ────────────────────────
    const EntityModel = ENTITY_TYPE_TO_MODEL(type);
    
    if (!EntityModel) {
      logWithTime(`❌ [createReviewNoteService] No model mapping for type: ${type}`);
      return {
        success: false,
        message: `Entity type ${type} is not supported`,
        errorCode: CONFLICT
      };
    }

    const entity = await EntityModel.findOne({ _id: targetEntityId, isDeleted: false });

    if (!entity) {
      logWithTime(`❌ [createReviewNoteService] ${type} entity not found: ${targetEntityId}`);
      return {
        success: false,
        message: `${type} entity not found`,
        errorCode: CONFLICT
      };
    }

    // ── 4. Validate phase context ────────────────────────────────────────────
    if (!phaseContext) {
      logWithTime(`❌ [createReviewNoteService] Phase context not provided`);
      return {
        success: false,
        message: `Phase context is required`,
        errorCode: CONFLICT
      };
    }

    if (phaseContext.isFrozen) {
      logWithTime(`❌ [createReviewNoteService] Cannot add review note. ${phaseName} phase is frozen.`);
      return {
        success: false,
        message: `Cannot add review note. ${phaseName} phase is frozen.`,
        errorCode: CONFLICT
      };
    }

    // ── 5. Create review note document ──────────────────────────────────────
    const newReviewNote = await ReviewNoteModel.create({
      projectId: entity.projectId,
      entityId: targetEntityId,
      entityType: type,
      description: description.trim(),
      createdBy: reviewerId
    });

    logWithTime(`✅ [createReviewNoteService] Review note created: ${newReviewNote._id}`);

    // ── 6. Log activity tracker event ───────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.REVIEW_NOTE_CREATED,
      `Review note added to ${type}: "${entity.title || entity.name}" in ${phaseName} phase`,
      {
        newData: newReviewNote,
        adminActions: { targetId: newReviewNote._id }
      }
    );

    // ── 7. Call version control service ───────────────────────────────────────
    await manualVersionControlService({
      projectId: entity.projectId,
      currentPhase: phaseName,
      action: `Review note added to ${type} (Review Note ID: ${newReviewNote._id})`,
      performedBy: reviewerId,
      auditContext
    });

    return { success: true, reviewNote: newReviewNote };

  } catch (error) {
    logWithTime(`❌ [createReviewNoteService] Error: ${error.message}`);
    return {
      success: false,
      message: "Error creating review note",
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { createReviewNoteService };
