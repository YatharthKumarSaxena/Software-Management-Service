// services/ideas/create-idea.service.js

const mongoose = require("mongoose");
const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR, CONFLICT, BAD_REQUEST } = require("@configs/http-status.config");
const { counterServices } = require("@services/common/counter.service");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { convertContentToEnglishService, classifyIdeaAsync } = require("@services/ai-model/ai-model.service");

/**
 * Creates a new idea document in the database.
 * Calls the AI Model Service to convert rawTitle/rawDescription to English.
 * If need_clarification is true, rejects the creation.
 * If successful, creates the idea and asynchronously invokes entity classification in the background.
 *
 * @param {Object} params
 * @param {string} params.projectId       - Project MongoDB ObjectId
 * @param {string} params.rawTitle        - Raw idea title
 * @param {string} [params.rawDescription]- Raw idea description
 * @param {string} params.createdBy       - Admin/Client USR ID
 * @param {Object} params.auditContext    - { user, device, requestId, workflowId }
 *
 * @returns {Promise<{ success: true, idea } | { success: false, message, errorCode }>}
 */
const createIdeaService = async ({
  projectId,
  rawTitle,
  rawDescription,
  createdBy,
  auditContext
}) => {
  try {
    const normalizedRawTitle = rawTitle.trim().replace(/\s+/g, " ");
    const normalizedRawDescription = rawDescription?.trim() || null;

    // ── Pre-check: Check if rawTitle duplicate already exists in project ──────
    const existingIdeaByRawTitle = await IdeaModel.findOne({
      projectId,
      rawTitle: normalizedRawTitle,
      isDeleted: false
    }).collation({ locale: "en", strength: 2 });

    if (existingIdeaByRawTitle) {
      logWithTime(`❌ [createIdeaService] Idea with raw title "${normalizedRawTitle}" already exists`);
      return { 
        success: false, 
        message: "An idea with this title already exists", 
        errorCode: CONFLICT 
      };
    }

    // ── Step 1: Call AI Model Service to Convert Content to English ───────────
    logWithTime(`🤖 [createIdeaService] Converting idea content to English`);
    const conversionResult = await convertContentToEnglishService({
      rawTitle: normalizedRawTitle,
      rawDescription: normalizedRawDescription,
      deviceUuid: auditContext?.device?.uuid || auditContext?.device?.DEVICE_UUID
    });

    if (!conversionResult.success) {
      logWithTime(`❌ [createIdeaService] Failed to convert content to English: ${conversionResult.message}`);
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

    // ── Step 2: Validate clarification flag ──────────────────────────────────
    if (need_clarification) {
      logWithTime(`⚠️ [createIdeaService] AI model indicated content needs clarification (irrelevant/unclear)`);
      return {
        success: false,
        message: "The provided title or description is unclear or irrelevant. Please provide relevant and meaningful content.",
        errorCode: BAD_REQUEST
      };
    }

    const finalTitle = convertedTitle?.trim() || normalizedRawTitle;
    const finalDescription = (convertedDescription && convertedDescription.trim().length >= 10)
      ? convertedDescription.trim()
      : (normalizedRawDescription || null);

    // ── Step 3: Check duplicate converted title in active project records ──────
    const existingIdeaByTitle = await IdeaModel.findOne({
      projectId,
      title: finalTitle,
      isDeleted: false
    }).collation({ locale: "en", strength: 2 });

    if (existingIdeaByTitle) {
      logWithTime(`❌ [createIdeaService] Idea with title "${finalTitle}" already exists in project`);
      return {
        success: false,
        message: "An idea with this title already exists",
        errorCode: CONFLICT
      };
    }

    // ── Step 4: Call counter service to get sequence and custom id ────────────
    const counterResult = await counterServices.ideaCounterService(projectId);
    if (!counterResult.success) {
      logWithTime(`❌ [createIdeaService] Error generating idea sequence for project: ${projectId}`);
      return {
        success: false,
        message: "Failed to generate idea sequence",
        errorCode: INTERNAL_ERROR
      };
    }

    // ── Step 5: Create the idea document ──────────────────────────────────────
    logWithTime(`[createIdeaService] Creating idea document`);

    const newIdea = new IdeaModel({
      id: counterResult.generatedId,
      sequence: counterResult.sequence,
      rawTitle: normalizedRawTitle,
      rawDescription: normalizedRawDescription,
      title: finalTitle,
      description: finalDescription,
      status: IdeaStatuses.PENDING,
      createdBy,
      updatedBy: createdBy,
      projectId: new mongoose.Types.ObjectId(projectId),
      aiPredictedClass: null,
      aiPredictionSummary: null
    });

    const savedIdea = await newIdea.save();

    if (!savedIdea) {
      logWithTime(`❌ [createIdeaService] Failed to create idea`);
      return { success: false, message: "Failed to create idea", errorCode: INTERNAL_ERROR };
    }

    // ── Step 6: Log activity tracker event ────────────────────────────────────
    const { user, device, requestId, workflowId } = auditContext || {};
    logActivityTrackerEvent({
      user,
      device,
      requestId,
      workflowId,
      eventType: ACTIVITY_TRACKER_EVENTS.CREATE_IDEA,
      description: `Idea "${finalTitle}" created for project`,
      logOptions: {
        newData: prepareAuditData(null, savedIdea).newData,
        userActions: {
          targetId: savedIdea._id?.toString(),
          performedOn: DB_COLLECTIONS.IDEAS
        }
      }
    });

    logWithTime(`✅ [createIdeaService] Idea created with ID: ${savedIdea._id}`);

    // ── Step 7: Trigger asynchronous entity classification (non-blocking) ─────
    classifyIdeaAsync({
      ideaId: savedIdea._id,
      projectId: savedIdea.projectId,
      rawTitle: savedIdea.rawTitle,
      rawDescription: savedIdea.rawDescription,
      deviceUuid: device?.uuid || device?.DEVICE_UUID
    });

    return { success: true, idea: savedIdea };

  } catch (error) {
    logWithTime(`❌ [createIdeaService] Error: ${error.message}`);
    if (error.code === 11000) {
      return { success: false, message: "An idea with this title already exists", errorCode: CONFLICT };
    }
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message, errorCode: BAD_REQUEST };
    }
    return { success: false, message: "Internal error while creating idea", error: error.message, errorCode: INTERNAL_ERROR };
  }
};

module.exports = { createIdeaService };
