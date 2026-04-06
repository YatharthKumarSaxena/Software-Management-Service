// services/ideas/update-idea.service.js

const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, BAD_REQUEST, UNAUTHORIZED } = require("@configs/http-status.config");

/**
 * Updates an idea's title and/or description.
 * Only allowed if idea status is PENDING.
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 * @param {Object} params
 * @param {string} [params.title] - New title
 * @param {string} [params.description] - New description
 * @param {string} params.updatedBy - User ID who updated
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 *
 * @returns {Object} { success: true, idea } | { success: false, message, errorCode }}
 */
const updateIdeaService = async (
  idea,
  { title, description, updatedBy, auditContext }
) => {
  try {
    // ── Step 1: Check ownership - only creator can update ──────────────
    if (idea.createdBy.toString() !== updatedBy.toString()) {
      logWithTime(
        `❌ [updateIdeaService] User ${updatedBy} is not the creator of idea ${idea._id}. Creator: ${idea.createdBy}`
      );
      return {
        success: false,
        message: "You are not authorized to update this idea. Only the creator can modify it.",
        errorCode: UNAUTHORIZED
      };
    }

    // ── Step 2: Check if idea is in PENDING status ──────────────────────
    if (idea.status !== IdeaStatuses.PENDING) {
      logWithTime(
        `❌ [updateIdeaService] Cannot update idea (status: ${idea.status}). Only PENDING ideas can be updated.`
      );
      return {
        success: false,
        message: `Cannot update idea in ${idea.status} status. Only PENDING ideas can be updated.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Step 3: Check if any changes are being made ────────────────────
    const titleChanged = title !== undefined && idea.title !== title;
    const descriptionChanged = description !== undefined && idea.description !== description;

    if (!titleChanged && !descriptionChanged) {
      logWithTime(
        `⚠️ [updateIdeaService] No changes detected for idea ${idea._id}`
      );
      return {
        success: true,
        message: "No changes detected",
        idea
      };
    }

    // ── Step 4: Check if title is being changed and if it's unique ────
    if (titleChanged) {
      const normalizedTitle = title.trim();
      const existingIdea = await IdeaModel.findOne({
        projectId: idea.projectId,
        title: normalizedTitle,
        _id: { $ne: idea._id },
        isDeleted: false
      }).collation({ locale: "en", strength: 2 });

      if (existingIdea) {
        logWithTime(
          `❌ [updateIdeaService] Idea with title "${normalizedTitle}" already exists in project`
        );
        return {
          success: false,
          message: "An idea with this title already exists",
          errorCode: CONFLICT
        };
      }
    }

    // ── Step 5: Build update payload ────────────────────────────────────
    const updatePayload = { updatedBy, updatedAt: new Date() };
    
    if (titleChanged) {
      updatePayload.title = title.trim();
    }
    
    if (descriptionChanged) {
      updatePayload.description = description;
    }

    // ── Step 6: Update via atomic findByIdAndUpdate ──────────────────────
    const oldIdeaData = { ...idea.toObject ? idea.toObject() : idea };
    
    const updatedIdea = await IdeaModel.findByIdAndUpdate(
      idea._id,
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedIdea) {
      logWithTime(`❌ [updateIdeaService] Failed to update idea ${idea._id}`);
      return {
        success: false,
        message: "Failed to update idea",
        errorCode: CONFLICT
      };
    }

    // ── Step 7: Log activity tracker event ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldIdeaData, updatedIdea);
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.UPDATE_IDEA,
      `Idea updated`,
      { oldData, newData, adminActions: { targetId: idea._id } }
    );

    logWithTime(`✅ [updateIdeaService] Idea updated successfully: ${idea._id}`);
    
    return { success: true, idea: updatedIdea };

  } catch (error) {
    logWithTime(`❌ [updateIdeaService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while updating idea", error: error.message };
  }
};

module.exports = { updateIdeaService };
