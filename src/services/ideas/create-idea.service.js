// services/ideas/create-idea.service.js

const mongoose = require("mongoose");
const { ProjectModel } = require("@models/project.model");
const { IdeaModel } = require("@models/idea.model");
const { IdeaStatuses } = require("@configs/enums.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR, NOT_FOUND, CONFLICT } = require("@configs/http-status.config");

/**
 * Creates a new idea document in the database.
 *
 * @param {Object} params
 * @param {string} params.projectId       - Project MongoDB ObjectId
 * @param {string} params.title           - Idea title
 * @param {string} params.description     - Idea description
 * @param {string} params.createdBy       - Admin USR ID
 * @param {Object} params.auditContext    - { user, device, requestId }
 *
 * @returns {{ success: true, idea } | { success: false, message, errorCode }}
 */
const createIdeaService = async ({
  projectId,
  title,
  description,
  createdBy,
  auditContext
}) => {
  try {
    
    const normalizedTitle = title.trim();
    const existingIdea = await IdeaModel.findOne({
      projectId,
      title: normalizedTitle,
      isDeleted: false
    }).collation({ locale: "en", strength: 2 });

    if (existingIdea) {
      logWithTime(`❌ [createIdeaService] Idea with this title already exists`);
      return { 
        success: false, 
        message: "An idea with this title already exists", 
        errorCode: CONFLICT 
      };
    }

    // ── Step 3: Create the idea document ──────────────────────────────
    logWithTime(`[createIdeaService] Creating idea document`);
    
    const newIdea = new IdeaModel({
      title: normalizedTitle,
      description,
      status: IdeaStatuses.PENDING,
      createdBy,
      updatedBy: createdBy,
      projectId: mongoose.Types.ObjectId(projectId)
    });

    const savedIdea = await newIdea.save();

    if (!savedIdea) {
      logWithTime(`❌ [createIdeaService] Failed to create idea`);
      return { success: false, message: "Failed to create idea", errorCode: INTERNAL_ERROR };
    }

    // ── Step 4: Log activity tracker event ────────────────────────────
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.CREATE_IDEA,
      `Idea "${normalizedTitle}" created for project`,
      { newData: prepareAuditData(null, savedIdea).newData, adminActions: { targetId: projectId } }
    );

    logWithTime(`✅ [createIdeaService] Idea created with ID: ${savedIdea._id}`);
    
    return { success: true, idea: savedIdea };

  } catch (error) {
    logWithTime(`❌ [createIdeaService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while creating idea", error: error.message };
  }
};

module.exports = { createIdeaService };
