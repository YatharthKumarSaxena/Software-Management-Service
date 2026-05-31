// services/scopes/create-scope.service.js

const { ScopeModel } = require("@models/scope-model");
const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { manualVersionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { Phases, ScopeCategoryTypes } = require("@/configs/enums.config");
const { counterServices } = require("@services/common/counter.service");

/**
 * Creates a new scope for an inception document.
 *
 * @param {Object} params
 * @param {Object} params.inception - The Inception document
 * @param {string} params.projectId - Project ID (required)
 * @param {string} params.title - Scope title (required)
 * @param {string} params.description - Scope description (optional)
 * @param {string} params.type - Scope type IN_SCOPE | OUT_SCOPE | CONSTRAINT (optional, defaults to IN_SCOPE)
 * @param {string} params.linkFeatureId - HLF feature ID to link scope to (optional)
 * @param {string} params.createdBy - USR-prefixed custom ID of the admin creating the scope
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, scope?: Object, message?: string, error?: string }}
 */
const createScopeService = async ({
  inception,
  projectId,
  title,
  description = null,
  type = null,
  linkFeatureId = null,
  createdBy,
  auditContext,
}) => {
  try {
    const inceptionId = inception._id.toString();

    // ── Guard: prevent duplicate scope title per inception ──────────────────
    const normalizedTitle = title.trim().replace(/\s+/g, " ");
    const normalizedDescription = description?.trim() || null;

    const existing = await ScopeModel.findOne({
      inceptionId,
      title: normalizedTitle,
      type: type,
      isDeleted: false
    }).collation({ locale: "en", strength: 2 });

    if (existing) {
      return { success: false, message: "Scope with this title already exists in this inception." };
    }

    // ── Determine category based on linkFeatureId ────────────────────────────
    let category = ScopeCategoryTypes.GLOBAL;
    let featureId = null;

    if (linkFeatureId) {
      // Check if HLF feature exists
      const feature = await HighLevelFeatureModel.findById(linkFeatureId);
      if (!feature || feature.isDeleted) {
        return { success: false, message: "The specified HLF feature does not exist or is deleted." };
      }
      category = ScopeCategoryTypes.LOCAL;
      featureId = feature._id;
    }

    // ── Call counter service to get sequence and id ──────────────────────────
    const counterResult = await counterServices.scopeCounterService(projectId);
    if (!counterResult.success) {
      logWithTime(`❌ [createScopeService] Error generating Scope sequence for project: ${projectId}`);
      return { success: false, message: "Failed to generate Scope sequence" };
    }

    // ── Create scope ────────────────────────────────────────────────────────
    const scopeData = {
      inceptionId,
      projectId,
      title: normalizedTitle,
      description: normalizedDescription,
      type: type || null,
      category,
      featureId,
      sequence: counterResult.sequence,
      id: counterResult.generatedId,
      createdBy,
    };

    const scope = await ScopeModel.create(scopeData);

    // ── Version control ────────────────────────────────────────────────────
    await manualVersionControlService({
      projectId: inception.projectId,
      currentPhase: Phases.INCEPTION,
      action: `Scope "${normalizedTitle}" created with category ${category} — version bump`,
      performedBy: createdBy,
      auditContext: auditContext
    });

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_SCOPE,
      `Scope "${normalizedTitle}" created for inception ${inceptionId} with category ${category} by ${createdBy}`,
      {
        newData: prepareAuditData(null, scope).newData,
        adminActions: { targetId: scope._id?.toString() },
      }
    );

    return { success: true, scope };

  } catch (error) {
    logWithTime(`❌ [createScopeService] Error caught while creating scope`);
    errorMessage(error);
    if (error.code === 11000) {
      return {
        success: false,
        message: "Scope with this title already exists in this inception."
      };
    }
    if (error.name === "ValidationError") {
      logWithTime(`[createScopeService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[createScopeService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while creating scope", error: error.message };
  }
};

module.exports = { createScopeService };
