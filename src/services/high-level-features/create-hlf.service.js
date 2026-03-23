// services/high-level-features/create-hlf.service.js

const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { versionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

/**
 * Creates a new high-level feature for an inception document.
 *
 * @param {Object} params
 * @param {Object} params.inception - The Inception document
 * @param {string} params.title - HLF title (required)
 * @param {string} params.description - HLF description (optional)
 * @param {string} params.createdBy - USR-prefixed custom ID of the admin creating the HLF
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, hlf?: Object, message?: string, error?: string }}
 */
const createHlfService = async ({
  inception,
  title,
  description = null,
  createdBy,
  auditContext,
}) => {
  try {
    const inceptionId = inception._id.toString();

    // ── Guard: prevent duplicate HLF title per inception ──────────────────
    const normalizedTitle = title.trim();

    const existing = await HighLevelFeatureModel.findOne({
      inceptionId,
      title: normalizedTitle,
      isDeleted: false
    }).collation({ locale: "en", strength: 2 });

    if (existing) {
      return { success: false, message: "High-level feature with this title already exists in this inception." };
    }

    // ── Create HLF ────────────────────────────────────────────────────────
    const hlfData = {
      inceptionId,
      title: normalizedTitle,
      description: description || null,
      createdBy,
    };

    const hlf = await HighLevelFeatureModel.create(hlfData);

    // ── Version control ────────────────────────────────────────────────────
    await versionControlService(
      inception,
      `High-level feature "${title}" created — version bump`,
      createdBy,
      auditContext
    );

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
        message: "High-level feature with this title already exists in this inception."
      };
    }
    if (error.name === "ValidationError") {
      logWithTime(`[createHlfService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[createHlfService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while creating high-level feature", error: error.message };
  }
};

module.exports = { createHlfService };
