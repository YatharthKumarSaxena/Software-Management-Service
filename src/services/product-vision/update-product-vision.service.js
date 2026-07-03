// services/product-vision/update-product-vision.service.js

const { InceptionModel } = require("@models/inception.model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases } = require("@/configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

/**
 * Updates product vision with change detection.
 * Only logs activity if changes are actually detected.
 *
 * @param {Object} params
 * @param {Object} params.inception - The Inception document to update
 * @param {Object} params.project - The Project document (for version control)
 * @param {string} params.productVision - Updated product vision content
 * @param {string} params.updatedBy - USR-prefixed custom ID of the admin updating
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, inception?: Object, message?: string, error?: string }}
 */
const updateProductVisionService = async ({
  inception,
  project,
  productVision,
  updatedBy,
  auditContext,
}) => {
  try {
    // ── Store old inception for comparison ────────────────────────────────────────
    const oldInception = inception.toObject
      ? inception.toObject()
      : JSON.parse(JSON.stringify(inception));

    const normalizedProductVision = productVision.trim();

    // ── Check for changes ──────────────────────────────────────────────────────────
    if (normalizedProductVision === inception.productVision) {
      return { success: true, message: "No changes detected", inception };
    }

    const updatedInception = await InceptionModel.findByIdAndUpdate(
      inception._id,
      {
        $set: {
          productVision: normalizedProductVision,
          updatedBy: updatedBy
        }
      },
      { new: true, runValidators: true }
    );

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId,
      currentPhase: Phases.INCEPTION,
      action: `Product vision updated — version bump`,
      performedBy: updatedBy,
      auditContext: auditContext
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldInception, updatedInception);

    logActivityTrackerEvent({
      user: auditUser,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.UPDATE_PRODUCT_VISION,
      description: `Product vision updated for inception ${updatedInception._id?.toString()} by ${updatedBy}`,
      logOptions: {
        oldData,
        newData,
        adminActions: { performedOn: DB_COLLECTIONS.INCEPTIONS, targetId: updatedInception._id?.toString() }
      }
  });

    return { success: true, inception: updatedInception };

  } catch (error) {
    logWithTime(`❌ [updateProductVisionService] Error caught while updating product vision`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[updateProductVisionService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[updateProductVisionService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while updating product vision", error: error.message };
  }
};

module.exports = { updateProductVisionService };
