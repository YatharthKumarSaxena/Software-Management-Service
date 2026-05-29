// services/high-level-features/update-hlf.service.js

const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { IdeaModel } = require("@models/idea.model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases } = require("@/configs/enums.config");
const { CONFLICT, NOT_FOUND, BAD_REQUEST, INTERNAL_ERROR, OK } = require("@configs/http-status.config");

/**
 * Updates an existing high-level feature with change detection.
 * Only logs activity if changes are actually detected.
 *
 * @param {Object} params
 * @param {Object} params.hlf - The HLF document to update
 * @param {Object} params.inception - The Inception document (for version control)
 * @param {Object} params.project - The Project document (for version control)
 * @param {string} params.title - Updated title (optional)
 * @param {string} params.description - Updated description (optional)
 * @param {string} params.linkedIdeaId - Idea ID to link to (optional)
 * @param {string} params.updatedBy - USR-prefixed custom ID of the admin updating
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, hlf?: Object, message?: string, error?: string }}
 */
const updateHlfService = async ({
  hlf,
  inception,
  project,
  title = null,
  description = null,
  linkedIdeaId = null,
  updatedBy,
  auditContext,
}) => {
  try {
    // ── Store old HLF for comparison ────────────────────────────────────────
    const oldHlf = hlf.toObject ? hlf.toObject() : { ...hlf };

    // ── Update only provided fields ──────────────────────────────────────────
    let hasChanges = false;

    if (description !== null) {
      const normalizedDescription = description?.trim() || null;

      if (normalizedDescription !== hlf.description) {
        hlf.description = normalizedDescription;
        hasChanges = true;
      }
    }

    if (title !== null) {
      const normalizedTitle = title.trim().replace(/\s+/g, " ");

      if (normalizedTitle !== hlf.title) {

        const existing = await HighLevelFeatureModel.findOne({
          inceptionId: hlf.inceptionId,
          title: normalizedTitle,
          isDeleted: false,
          _id: { $ne: hlf._id }
        }).collation({ locale: "en", strength: 2 });

        if (existing) {
          return {
            success: false,
            message: "High-level feature with this title already exists in this inception.",
            errorCode: CONFLICT
          };
        }

        hlf.title = normalizedTitle;
        hasChanges = true;
      }
    }

    // ── Validate and update linkedIdeaId if provided ──────────────────────────
    if (linkedIdeaId !== null) {
      const idea = await IdeaModel.findOne({
        _id: linkedIdeaId,
        isDeleted: false
      });

      if (!idea) {
        return { success: false, message: "Idea with the provided ID does not exist or is deleted.", errorCode: NOT_FOUND };
      }

      const hlfCurrentIdeaId = hlf.ideaId?.toString();
      if (hlfCurrentIdeaId !== linkedIdeaId) {
        hlf.ideaId = idea._id;
        hasChanges = true;
      }
    }

    // ── If no changes, return early ──────────────────────────────────────────
    if (!hasChanges) {
      return { success: true, message: "No changes detected", hlf, errorCode: OK };
    }

    // ── Update timestamp and updatedBy ──────────────────────────────────────
    hlf.updatedBy = updatedBy;
    const updatedHlf = await hlf.save();

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId,
      currentPhase: Phases.INCEPTION,
      action: `High-level feature "${updatedHlf.title}" updated — version bump`,
      performedBy: updatedBy,
      auditContext: auditContext
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldHlf, updatedHlf);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_HLF,
      `High-level feature "${updatedHlf.title}" updated by ${updatedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: updatedHlf._id?.toString() },
      }
    );

    return { success: true, hlf: updatedHlf };

  } catch (error) {
    logWithTime(`❌ [updateHlfService] Error caught while updating high-level feature`);
    errorMessage(error);

    if (error.code === 11000) {
      return {
        success: false,
        message: "High-level feature with this title already exists in this inception.",
        errorCode: CONFLICT
      };
    }
    if (error.name === "ValidationError") {
      logWithTime(`[updateHlfService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message, errorCode: BAD_REQUEST };
    }

    logWithTime(`[updateHlfService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while updating high-level feature", error: error.message, errorCode: INTERNAL_ERROR };
  }
};

module.exports = { updateHlfService };
