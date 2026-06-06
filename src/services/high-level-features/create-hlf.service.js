// services/high-level-features/create-hlf.service.js

const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { IdeaModel } = require("@models/idea.model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases } = require("@/configs/enums.config");
const { CONFLICT, NOT_FOUND, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { counterServices } = require("@services/common/counter.service");

/**
 * Creates a new high-level feature for an inception document.
 *
 * @param {Object} params
 * @param {Object} params.inception - The Inception document
 * @param {string} params.projectId - Project ID (required)
 * @param {string} params.title - HLF title (required)
 * @param {string} params.description - HLF description (optional)
 * @param {string} params.linkedIdeaId - Idea ID to link to (optional)
 * @param {string} params.createdBy - USR-prefixed custom ID of the admin creating the HLF
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, hlf?: Object, message?: string, error?: string }}
 */
const createHlfService = async ({
  inception,
  projectId,
  title,
  description = null,
  linkedIdeaId = null,
  createdBy,
  auditContext,
}) => {
  try {
    const inceptionId = inception._id.toString();

    // ── Guard: prevent duplicate HLF title per inception ──────────────────
    const normalizedTitle = title.trim().replace(/\s+/g, " ");
    const normalizedDescription = description?.trim() || null;

    const existing = await HighLevelFeatureModel.findOne({
      projectId,
      title: normalizedTitle,
      isDeleted: false
    }).collation({ locale: "en", strength: 2 });

    if (existing) {
      return { success: false, message: "High-level feature with this title already exists in this inception.", errorCode: CONFLICT };
    }

    // ── Validate linkedIdeaId if provided ────────────────────────────────────
    let ideaId = null;
    if (linkedIdeaId) {
      const idea = await IdeaModel.findOne({
        _id: linkedIdeaId,
        isDeleted: false
      });

      if (!idea) {
        return { success: false, message: "Idea with the provided ID does not exist or is deleted.", errorCode: NOT_FOUND };
      }

      ideaId = linkedIdeaId;
    }

    // ── Call counter service to get sequence and id ──────────────────────────
    const counterResult = await counterServices.hlfCounterService(projectId);
    if (!counterResult.success) {
      logWithTime(`❌ [createHlfService] Error generating HLF sequence for project: ${projectId}`);
      return { success: false, message: "Failed to generate HLF sequence", errorCode: INTERNAL_ERROR };
    }

    // ── Create HLF ────────────────────────────────────────────────────────
    const hlfData = {
      inceptionId,
      projectId,
      title: normalizedTitle,
      description: normalizedDescription,
      ideaId,
      sequence: counterResult.sequence,
      id: counterResult.generatedId,
      createdBy,
    };

    const hlf = await HighLevelFeatureModel.create(hlfData);

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId,
      currentPhase: Phases.INCEPTION,
      action: `High-level feature "${title}" created — version bump`,
      performedBy: createdBy,
      auditContext: auditContext
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_HLF,
      `High-level feature "${title}" created for inception ${inceptionId} by ${createdBy}`,
      {
        newData: prepareAuditData(null, hlf).newData,
        adminActions: { targetId: hlf._id?.toString() },
      }
    );

    return { success: true, hlf };

  } catch (error) {
    logWithTime(`❌ [createHlfService] Error caught while creating high-level feature`);
    errorMessage(error);
    if (error.code === 11000) {
      return {
        success: false,
        message: "High-level feature with this title already exists in this inception.",
        errorCode: CONFLICT
      };
    }
    if (error.name === "ValidationError") {
      logWithTime(`[createHlfService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message, errorCode: BAD_REQUEST };
    }

    logWithTime(`[createHlfService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while creating high-level feature", error: error.message, errorCode: INTERNAL_ERROR };
  }
};

module.exports = { createHlfService };
