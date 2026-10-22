// services/ideas/update-idea.service.js

const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, BAD_REQUEST, UNAUTHORIZED, INTERNAL_ERROR } = require("@configs/http-status.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { convertContentToEnglishService, classifyIdeaAsync } = require("@services/ai-model/ai-model.service");

/**
 * Updates an idea's rawTitle and/or rawDescription.
 * Calls the AI Model Service to convert the updated content to English.
 * If need_clarification is true, rejects the update without modifying data.
 * If successful, updates the idea and asynchronously invokes entity classification in the background.
 * Only allowed if idea status is PENDING and requester is creator.
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 * @param {Object} params
 * @param {string} [params.rawTitle] - New raw title
 * @param {string} [params.rawDescription] - New raw description
 * @param {string} params.updatedBy - User ID who updated
 * @param {Object} params.auditContext - Audit context {user, device, requestId, workflowId}
 *
 * @returns {Promise<{ success: true, idea, message?: string } | { success: false, message, errorCode }>}
 */
const updateIdeaService = async (
  idea,
  { rawTitle, rawDescription, updatedBy, auditContext }
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
    const normalizedRawTitle =
      rawTitle !== undefined
        ? rawTitle.trim().replace(/\s+/g, " ")
        : undefined;

    const normalizedRawDescription =
      rawDescription !== undefined
        ? (rawDescription?.trim() || null)
        : undefined;

    const rawTitleChanged =
      normalizedRawTitle !== undefined &&
      normalizedRawTitle !== idea.rawTitle;

    const rawDescriptionChanged =
      normalizedRawDescription !== undefined &&
      normalizedRawDescription !== (idea.rawDescription || null);

    if (!rawTitleChanged && !rawDescriptionChanged) {
      logWithTime(
        `⚠️ [updateIdeaService] No changes detected for idea ${idea._id}`
      );
      return {
        success: true,
        message: "No changes detected",
        idea
      };
    }

    const effectiveRawTitle = rawTitleChanged ? normalizedRawTitle : (idea.rawTitle || idea.title);
    const effectiveRawDescription = rawDescriptionChanged ? normalizedRawDescription : (idea.rawDescription || null);

    // ── Step 4: Check if rawTitle is changed and if it's unique in project ────
    if (rawTitleChanged) {
      const existingIdea = await IdeaModel.findOne({
        projectId: idea.projectId,
        rawTitle: normalizedRawTitle,
        _id: { $ne: idea._id },
        isDeleted: false
      }).collation({ locale: "en", strength: 2 });

      if (existingIdea) {
        logWithTime(
          `❌ [updateIdeaService] Idea with raw title "${normalizedRawTitle}" already exists in project`
        );
        return {
          success: false,
          message: "An idea with this title already exists",
          errorCode: CONFLICT
        };
      }
    }

    // ── Step 5: Call AI Model Service to convert updated content to English ───
    logWithTime(`🤖 [updateIdeaService] Converting updated idea content to English`);
    const conversionResult = await convertContentToEnglishService({
      rawTitle: effectiveRawTitle,
      rawDescription: effectiveRawDescription,
      deviceUuid: auditContext?.device?.uuid || auditContext?.device?.DEVICE_UUID
    });

    if (!conversionResult.success) {
      logWithTime(`❌ [updateIdeaService] Failed to convert content to English: ${conversionResult.message}`);
      return {
        success: false,
        message: conversionResult.message || "Failed to process content with AI model service",
        errorCode: conversionResult.errorCode || INTERNAL_ERROR
      };
    }

    const {
      title: convertedTitle,
      description: convertedDescription,
      need_clarification
    } = conversionResult.data;

    // ── Step 6: Validate clarification flag ──────────────────────────────────
    if (need_clarification) {
      logWithTime(`⚠️ [updateIdeaService] AI model indicated content needs clarification (irrelevant/unclear)`);
      return {
        success: false,
        message: "The provided title or description is unclear or irrelevant. Please provide relevant and meaningful content.",
        errorCode: BAD_REQUEST
      };
    }

    const finalTitle = convertedTitle?.trim() || effectiveRawTitle;
    const finalDescription = (convertedDescription && convertedDescription.trim().length >= 10)
      ? convertedDescription.trim()
      : (effectiveRawDescription || null);

    // ── Step 7: Check if converted title conflicts with another idea ───────────
    const existingIdeaByTitle = await IdeaModel.findOne({
      projectId: idea.projectId,
      title: finalTitle,
      _id: { $ne: idea._id },
      isDeleted: false
    }).collation({ locale: "en", strength: 2 });

    if (existingIdeaByTitle) {
      logWithTime(`❌ [updateIdeaService] Idea with title "${finalTitle}" already exists in project`);
      return {
        success: false,
        message: "An idea with this title already exists",
        errorCode: CONFLICT
      };
    }

    // ── Step 8: Build update payload ──────────────────────────────────────────
    const updatePayload = {
      updatedBy,
      updatedAt: new Date(),
      title: finalTitle,
      description: finalDescription
    };

    if (rawTitleChanged) {
      updatePayload.rawTitle = normalizedRawTitle;
    }

    if (rawDescriptionChanged) {
      updatePayload.rawDescription = normalizedRawDescription;
    }

    // ── Step 9: Update via atomic findByIdAndUpdate ───────────────────────────
    const oldIdeaData = { ...(idea.toObject ? idea.toObject() : idea) };

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

    // ── Step 10: Log activity tracker event ───────────────────────────────────
    const { user, device, requestId, workflowId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldIdeaData, updatedIdea);
    logActivityTrackerEvent({
      user,
      device,
      requestId,
      workflowId,
      eventType: ACTIVITY_TRACKER_EVENTS.UPDATE_IDEA,
      description: `Idea updated`,
      logOptions: {
        oldData,
        newData,
        userActions: {
          targetId: idea._id?.toString(),
          performedOn: DB_COLLECTIONS.IDEAS
        }
      }
    });

    logWithTime(`✅ [updateIdeaService] Idea updated successfully: ${idea._id}`);

    // ── Step 11: Trigger asynchronous entity classification (non-blocking) ────
    classifyIdeaAsync({
      ideaId: updatedIdea._id,
      projectId: updatedIdea.projectId,
      rawTitle: updatedIdea.rawTitle,
      rawDescription: updatedIdea.rawDescription,
      deviceUuid: device?.uuid || device?.DEVICE_UUID
    });

    return { success: true, idea: updatedIdea };

  } catch (error) {
    logWithTime(`❌ [updateIdeaService] Error: ${error.message}`);
    if (error.code === 11000) {
      return { success: false, message: "An idea with this title already exists", errorCode: CONFLICT };
    }
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message, errorCode: BAD_REQUEST };
    }
    return { success: false, message: "Internal error while updating idea", error: error.message, errorCode: INTERNAL_ERROR };
  }
};

module.exports = { updateIdeaService };
