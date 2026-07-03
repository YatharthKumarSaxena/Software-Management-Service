// services/product-vision/create-product-vision.service.js

const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases } = require("@/configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

/**
 * Creates product vision for an inception document.
 *
 * @param {Object} params
 * @param {Object} params.inception - The Inception document
 * @param {string} params.productVision - Product vision content (required)
 * @param {string} params.createdBy - USR-prefixed custom ID of the admin creating the product vision
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, inception?: Object, message?: string, error?: string }}
 */
const createProductVisionService = async ({
  inception,
  productVision,
  createdBy,
  auditContext,
}) => {
  try {
    // ── Guard: prevent overwriting existing product vision ──────────────────
    if (inception.productVision) {
      return { success: false, message: "Product vision already exists" };
    }

    // ── Store old inception for comparison ────────────────────────────────────────
    const oldInception = inception.toObject ? inception.toObject() : { ...inception };

    // ── Create product vision ────────────────────────────────────────────────────────
    inception.productVision = productVision.trim();
    inception.updatedBy = createdBy;

    const updatedInception = await inception.save();

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId,
      currentPhase: Phases.INCEPTION,
      action: `Product vision created — version bump`,
      performedBy: createdBy,
      auditContext: auditContext
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldInception, updatedInception);

    logActivityTrackerEvent({
      auditUser,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.CREATE_PRODUCT_VISION,
      description: `Product vision created for inception ${inception._id?.toString()} by ${createdBy}`,
      logOptions: {
        oldData: oldData,
        newData: newData,
        userActions: { performedOn: DB_COLLECTIONS.INCEPTIONS, targetId: inception._id?.toString() }
      }
    });

    return { success: true, inception: updatedInception };

  } catch (error) {
    logWithTime(`❌ [createProductVisionService] Error caught while creating product vision`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[createProductVisionService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[createProductVisionService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while creating product vision", error: error.message };
  }
};

module.exports = { createProductVisionService };
