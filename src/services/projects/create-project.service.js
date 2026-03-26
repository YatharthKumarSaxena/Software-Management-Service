
const mongoose = require("mongoose");
const { ProjectModel } = require("@models/project.model");
const { InceptionModel } = require("@models/inception.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectCategoryTypes } = require("@configs/enums.config");
const { isValidMongoID } = require("@/utils/id-validators.util");
const { validateLinkedProjectIds } = require("@/services/projects/linked-projects.service");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Creates a new project document in the database.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.description
 * @param {string} params.problemStatement
 * @param {string} params.goal
 * @param {string} params.projectCategory          - Required. One of: individual | organization | multi_organization
 * @param {string[]} [params.orgIds]               - organization: array of exactly 1 MongoID | multi_organization: array min 1
 * @param {number} [params.expectedBudget]       - Optional
 * @param {number} [params.expectedTimelineInDays] - Optional
 * @param {string} params.createdBy
 * @param {string} params.projectCreationReasonType
 * @param {string} [params.projectCreationReasonDescription]
 * @param {Object} params.auditContext
 *
 * @returns {Object} { success: true, project } | { success: false, message, error? }
 */
const createProjectService = async ({
  name,
  description,
  problemStatement,
  goal,
  projectCategory,
  orgIds,
  linkedProjectIds,
  expectedBudget,
  expectedTimelineInDays,
  createdBy,
  projectCreationReasonType,
  projectCreationReasonDescription,
  projectComplexity,
  projectCriticality,
  projectPriority,
  auditContext
}) => {
  try {
    // ── Validate projectCategory (required) ─────────────────────────
    if (!projectCategory) {
      return { success: false, message: "projectCategory is required" };
    }
    if (!Object.values(ProjectCategoryTypes).includes(projectCategory)) {
      return { success: false, message: `projectCategory must be one of: ${Object.values(ProjectCategoryTypes).join(", ")}` };
    }

    // ── Resolve orgIds from category-specific inputs ─────────────────
    let resolvedOrgIds = [];

    if (projectCategory === ProjectCategoryTypes.INDIVIDUAL) {
      // No org association — force empty regardless of any supplied input
      resolvedOrgIds = [];

    } else if (projectCategory === ProjectCategoryTypes.ORGANIZATION) {
      if (!Array.isArray(orgIds) || orgIds.length !== 1) {
        return { success: false, message: "orgIds must be an array with exactly one entry for an organization project" };
      }
      if (!isValidMongoID(orgIds[0])) {
        return { success: false, message: "orgIds[0] must be a valid MongoDB ObjectId string" };
      }
      resolvedOrgIds = [orgIds[0].toString()];

    } else if (projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION) {
      if (!Array.isArray(orgIds) || orgIds.length < 1) {
        return { success: false, message: "orgIds array with at least one entry is required for a multi-organization project" };
      }
      if (!orgIds.every(id => isValidMongoID(id))) {
        return { success: false, message: "Every entry in orgIds must be a valid MongoDB ObjectId string" };
      }
      resolvedOrgIds = [...new Set(orgIds.map(id => id.toString()))];
    }

    const projectId = new mongoose.Types.ObjectId();

    const linkedProjectsValidation = await validateLinkedProjectIds({
      projectId,
      addedLinkedProjectIds: linkedProjectIds,
      removedLinkedProjectIds: null
    });

    if (!linkedProjectsValidation.success) {
      return linkedProjectsValidation;
    }

    // ── Persist ───────────────────────────────────────────────────────
    const project = await ProjectModel.create({
      _id: projectId,
      name,
      description,
      problemStatement,
      goal,
      projectCategory,
      orgIds: resolvedOrgIds,
      linkedProjectIds: linkedProjectsValidation.addedLinkedProjectIds,
      ...(expectedBudget !== undefined && { expectedBudget }),
      ...(expectedTimelineInDays !== undefined && { expectedTimelineInDays }),
      createdBy,
      projectCreationReasonType,
      projectCreationReasonDescription: projectCreationReasonDescription || null,
      ...(projectComplexity !== undefined && { projectComplexity }),
      ...(projectCriticality !== undefined && { projectCriticality }),
      ...(projectPriority !== undefined && { projectPriority }),
    });

    // ── Fire-and-forget: activity tracking ──────────────────────────
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_PROJECT,
      `Project '${project.name}' (${project._id}) created by ${createdBy}`,
      { newData: project }
    );
    logWithTime(`[createStakeholderService] Project is in INCEPTION phase, checking for side-effects`);

    // 1. Auto-create InceptionModel doc if not yet present
    const inceptionExists = await InceptionModel.findOne({ projectId: project._id, isDeleted: false });
    if (!inceptionExists) {
      logWithTime(`[createStakeholderService] Creating InceptionModel for project ${projectId}`);
      const inception = await InceptionModel.create({
        projectId: project._id,
        createdBy,
      });
      logWithTime(`[createStakeholderService] InceptionModel auto-created for project ${projectId}`);

      logActivityTrackerEvent(
        user,
        device,
        requestId,
        ACTIVITY_TRACKER_EVENTS.CREATE_INCEPTION,
        `InceptionModel for project '${project.name}' (${project._id}) auto-created during project creation by ${createdBy}`,
        { oldData: null, newData: inception }
      );
    } else {
      logWithTime(`[createStakeholderService] InceptionModel already exists for project ${projectId}`);
    }

    return { success: true, project };
  } catch (error) {
    if (error.name === "ValidationError") {
      logWithTime(`❌ [createProjectService] ValidationError: ${error.message}`);
      return {
        success: false,
        message: "Validation error",
        error: error.message,
      };
    }

    logWithTime(`❌ [createProjectService] Unexpected error [${error.name}]: ${error.message}`);
    return {
      success: false,
      message: "Internal error while creating project",
      error: error.message,
    };
  }
};

module.exports = { createProjectService };
