// services/stakeholders/create-stakeholder.service.js

const { ProjectModel } = require("@models/project.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { versionControlService } = require("@services/common/version.service");
const { convertOnHoldToActiveProjectService } = require("@services/projects/on-hold-project.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { Phases, ProjectStatus, ProjectCategoryTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

/**
 * Creates a new stakeholder and handles the side-effects:
 *  - Auto-creates InceptionModel document if project is in INCEPTION phase.
 *  - Promotes project status from DRAFT → ACTIVE.
 *  - Bumps the current-phase version via versionControlService.
 *
 * @param {Object} params
 * @param {Object} params.project
 * @param {string} params.project._id      - MongoDB ObjectId string of the project
 * @param {string} params.userId          - USR-prefixed custom ID (becomes stakeholderId)
 * @param {string} params.role            - Validated role (admin or client type)
 * @param {string|null} params.organizationId - MongoDB ObjectId string (clients only, else null)
 * @param {string} params.createdBy       - USR-prefixed custom ID of the acting admin
 * @param {Object} params.auditContext    - { admin, device, requestId }
 * @returns {{ success: boolean, stakeholder?: Object, message?: string, error?: string }}
 */
const createStakeholderService = async ({
  project,
  userId,
  role,
  organizationId = null,
  createdBy,
  auditContext,
}) => {
  try {

    const projectId = project._id.toString();
    
    // ── Guard: individual projects cannot have stakeholders ───────────────────
    if (project.projectCategory === ProjectCategoryTypes.INDIVIDUAL) {
      const existingStakeholder = await StakeholderModel.findOne({
        projectId: project._id,
        isDeleted: false
      });

      if (existingStakeholder) {
        return {
          success: false,
          message: "Individual projects can only have one stakeholder"
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

    // ── Guard: prevent duplicate stakeholder ──────────────────────────────────
    const existing = await StakeholderModel.findOne({
      userId: userId,
      projectId: projectId,
      isDeleted: false,
    });
    if (existing) {
      return { success: false, message: "Stakeholder already exists for this project" };
    }

    // ── Create stakeholder ────────────────────────────────────────────────────
    const stakeholderData = {
      userId,
      projectId: projectId,
      role,
      createdBy,
      phase: project.currentPhase,
    };
    if (project.projectCategory === ProjectCategoryTypes.INDIVIDUAL) {
    } else {
      const stakeholderOrgId = organizationId;
      // For org-based projects verify the stakeholder's org is associated with the project
      if (project.projectCategory === ProjectCategoryTypes.ORGANIZATION) {
        const projectOrgId = project.orgIds[0];
        if (stakeholderOrgId != projectOrgId) {
          logWithTime(`❌ [createStakeholderService] Cannot add stakeholder with org ${stakeholderOrgId} to organization project with org ${projectOrgId} | project ${projectId}`);
          return { success: false, message: "Your organisation is not associated with this project." };
        }
      }
      if (
        project.projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION
      ) {
        const orgMatches = Array.isArray(project.orgIds) &&
          project.orgIds.some(id => id.toString() === stakeholderOrgId);

        if (!orgMatches) {
          logWithTime(`❌ [createStakeholderService] User ${userId} org ${stakeholderOrgId} is not in project org list for project ${projectId}`);
          return { success: false, message: "Your organisation is not associated with this project." };
        }
      }
    }

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
    const { admin, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      admin,
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
