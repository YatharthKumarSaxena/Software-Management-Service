// services/stakeholders/create-stakeholder.service.js

const { ProjectModel } = require("@models/project.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { versionControlService } = require("@services/common/version.service");
const { convertOnHoldToActiveProjectService } = require("@services/projects/on-hold-project.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { Phases, ProjectStatus, ProjectCategoryTypes, ClientRoleTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { isValidMongoID } = require("@/utils/id-validators.util");

/**
 * Creates a new stakeholder and handles the side-effects:
 *  - Auto-creates InceptionModel document if project is in INCEPTION phase.
 *  - Promotes project status from DRAFT → ACTIVE.
 *  - Bumps the current-phase version via versionControlService.
 *
 * IMPORTANT: organizationId requirement depends on project category:
 *  - INDIVIDUAL projects: organizationId is NOT used (must be null)
 *  - ORGANIZATION projects: organizationId is NOT required (auto-determined from project)
 *  - MULTI_ORGANIZATION projects: organizationId IS REQUIRED and must be validated
 *
 * @param {Object} params
 * @param {Object} params.project
 * @param {string} params.project._id        - MongoDB ObjectId string of the project
 * @param {Object} params.user                - User object with clientId/adminId and organizationIds
 * @param {string} params.role                - Validated role (admin or client type)
 * @param {string|null} params.organizationId - MongoDB ObjectId string.
 *                                             REQUIRED: for MULTI_ORGANIZATION projects only
 *                                             MUST be: in user.organizationIds AND project.orgIds
 * @param {string} params.createdBy           - USR-prefixed custom ID of the acting admin
 * @param {Object} params.auditContext        - { admin, device, requestId }
 * @returns {{ success: boolean, stakeholder?: Object, message?: string, error?: string }}
 */
const createStakeholderService = async ({
  project,
  user,
  role,
  organizationId = null,
  createdBy,
  auditContext,
}) => {
  try {

    const projectId = project._id.toString();

    const userId = user.clientId;

    // ── Guard: prevent duplicate stakeholder ──────────────────────────────────
    const existing = await StakeholderModel.findOne({
      userId: userId,
      projectId: projectId,
      isDeleted: false,
    });
    if (existing) {
      return { success: false, message: "Stakeholder already exists for this project" };
    }

    // ── Guard: individual projects cannot have stakeholders ───────────────────
    if (project.projectCategory === ProjectCategoryTypes.INDIVIDUAL && user.clientId) {
      const existingClient = await StakeholderModel.findOne({
        projectId: project._id,
        role: { $in: Object.values(ClientRoleTypes) },
        isDeleted: false
      });

      if (existingClient) {
        return {
          success: false,
          message: "Individual projects can only have one client"
        };
      }
    }

    const blockedStatuses = [ProjectStatus.COMPLETED, ProjectStatus.ABORTED];
    if (blockedStatuses.includes(project.projectStatus)) {
      return {
        success: false,
        message: `Cannot add a stakeholder to a ${project.projectStatus} project`,
      };
    }

    if (project.projectCategory !== ProjectCategoryTypes.INDIVIDUAL && user.clientId) {

      const clientOrgIds = user.organizationIds || [];

      if (project.projectCategory === ProjectCategoryTypes.ORGANIZATION) {

        organizationId = project.orgIds[0];

        const belongsToOrg = clientOrgIds.some(
          id => id.toString() === organizationId.toString()
        );

        if (!belongsToOrg) {
          logWithTime(
            `❌ [createStakeholderService] Client ${userId} does not belong to organization ${organizationId} | project ${projectId}`
          );

          return {
            success: false,
            message: "Client does not belong to the required organisation."
          };
        }
      }

      if (project.projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION) {

        if (!organizationId) {
          logWithTime(
            `❌ [createStakeholderService] Missing organizationId for multi-organization project ${projectId} | client ${userId}`
          );

          return {
            success: false,
            message: "organizationId is required for multi-organization projects."
          };
        }

        if(!isValidMongoID(organizationId)) {
          logWithTime(
            `❌ [createStakeholderService] Invalid organizationId format for multi-organization project ${projectId} | client ${userId}`
          );

          return {
            success: false,
            message: "Invalid organizationId format. Must be a valid MongoDB ObjectId string."
          };
        }

        // Verify organizationId belongs to the client
        const clientHasOrg = clientOrgIds.some(
          id => id.toString() === organizationId.toString()
        );

        if (!clientHasOrg) {
          logWithTime(
            `❌ [createStakeholderService] Client ${userId} does not belong to organization ${organizationId} | project ${projectId}`
          );

          return {
            success: false,
            message: "The specified organization does not belong to the client."
          };
        }

        // Verify organizationId belongs to the project
        const projectHasOrg = project.orgIds.some(
          id => id.toString() === organizationId.toString()
        );

        if (!projectHasOrg) {
          logWithTime(
            `❌ [createStakeholderService] Organization ${organizationId} is not associated with project ${projectId} | client ${userId}`
          );

          return {
            success: false,
            message: "The specified organization is not associated with this project."
          };
        }
      }
    }

    // ── Auto-convert ON_HOLD → ACTIVE before proceeding ────────────────────────
    if (project.projectStatus === ProjectStatus.ON_HOLD) {
      const converted = await convertOnHoldToActiveProjectService(project, {
        convertedBy: createdBy,
        auditContext,
      });
      if (!converted.success) {
        return { success: false, message: converted.message };
      }
      logWithTime(`✅ [createStakeholderService] Project ${projectId} auto-converted ON_HOLD → ACTIVE`);
    }

    // ── Create stakeholder ────────────────────────────────────────────────────
    const stakeholderData = {
      userId,
      projectId,
      role,
      organizationId,
      createdBy,
      phase: project.currentPhase
    };

    const stakeholder = await StakeholderModel.create(stakeholderData);

    // ── Inception phase side-effects ──────────────────────────────────────────
    let updatedProject = project;

    if (project.currentPhase === Phases.INCEPTION) {

      // 1. Promote DRAFT → ACTIVE
      if (project.projectStatus === ProjectStatus.DRAFT) {
        updatedProject = await ProjectModel.findByIdAndUpdate(
          project._id,
          { $set: { projectStatus: ProjectStatus.ACTIVE } },
          { new: true }
        );
        logWithTime(`[createStakeholderService] Project ${projectId} promoted DRAFT → ACTIVE`);
      } else {
        logWithTime(`[createStakeholderService] Project status is ${project.projectStatus}, no status change needed`);
      }
    }

    // ── Version control ───────────────────────────────────────────────────────
    await versionControlService(
      updatedProject,
      `Stakeholder ${userId} added to project — version bump`,
      createdBy,
      auditContext
    );

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_STAKEHOLDER,
      `Stakeholder ${userId} (role: ${role}) added to project ${projectId} by ${createdBy}`,
      {
        newData: prepareAuditData(null, stakeholder).newData,
        adminActions: { targetId: stakeholder._id?.toString() },
      }
    );

    return { success: true, stakeholder };

  } catch (error) {
    logWithTime(`❌ [createStakeholderService] Error caught while creating stakeholder`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[createStakeholderService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[createStakeholderService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while creating stakeholder", error: error.message };
  }
};

module.exports = { createStakeholderService };
