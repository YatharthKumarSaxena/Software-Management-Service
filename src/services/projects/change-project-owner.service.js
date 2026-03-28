// services/projects/change-project-owner.service.js

const { ProjectModel } = require("@models/project.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { fetchAdmin } = require("@services/common/fetch-admin.service");
const { createStakeholderService } = require("@services/stakeholders/create-stakeholder.service");
const { updateStakeholderService } = require("@services/stakeholders/update-stakeholder.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectRoleTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND } = require("@configs/http-status.config");

/**
 * Changes the owner of a project.
 *
 * Steps:
 * 1. Check if new userId == existing ownerId → CONFLICT
 * 2. Fetch admin for new owner using userId
 * 3. Check if new owner is already a stakeholder
 *    - If yes: update role to OWNER
 *    - If no: create stakeholder with OWNER role
 * 4. Update previous owner's role (if prevOwnerRole provided in request, else use default ANALYST)
 * 5. Update project.ownerId
 * 6. Log activity tracker
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {string} project.ownerId
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.userId - New owner's USR ID
 * @param {string} params.changeOwnerReasonType
 * @param {string} [params.ownerChangeReasonDescription]
 * @param {string} [params.prevOwnerRole] - Optional: new role for previous owner (cannot be owner type). If not provided, defaults to analyst
 * @param {string} params.changedBy - Admin USR ID
 * @param {Object} params.auditContext - { admin, device, requestId }
 *
 * @returns {{ success: true, project } | { success: false, message, errorCode? }}
 */
const changeProjectOwnerService = async (project, params) => {
  try {
    const { userId, changeOwnerReasonType, ownerChangeReasonDescription, prevOwnerRole, changedBy, auditContext } = params;
    
    // ── Set default role for previous owner if not provided ─────────────────
    const DEFAULT_PREV_OWNER_ROLE = ProjectRoleTypes.ANALYST;
    const prevOwnerNewRole = prevOwnerRole || DEFAULT_PREV_OWNER_ROLE;

    // ── Step 1: Check if new userId == existing ownerId ───────────────────────
    if (userId === project.ownerId) {
      logWithTime(`❌ [changeProjectOwnerService] Attempting to set same owner ${userId} for project ${project._id}`);
      return {
        success: false,
        message: "New owner must be different from the current owner",
        errorCode: CONFLICT
      };
    }
    // ── Step 2: Fetch admin using userId ──────────────────────────────────────
    const newOwner = await fetchAdmin(null, null, userId);
    if (!newOwner) {
      logWithTime(`❌ [changeProjectOwnerService] Admin with userId ${userId} not found`);
      return {
        success: false,
        message: `Admin user '${userId}' not found`,
        errorCode: NOT_FOUND
      };
    }

    // ── Step 3: Check if user is already a stakeholder ───────────────────────
    const existingStakeholder = await StakeholderModel.findOne({
      userId: userId,
      projectId: project._id,
      isDeleted: false
    });

    // ── If not a stakeholder: create one with OWNER role ──────────────────────
    if (!existingStakeholder) {
      logWithTime(`[changeProjectOwnerService] Creating new stakeholder for userId ${userId}`);
      const createResult = await createStakeholderService({
        project,
        user: { adminId: userId, clientId: null },
        role: ProjectRoleTypes.OWNER,
        organizationId: null,
        createdBy: changedBy,
        auditContext
      });

      if (!createResult.success) {
        logWithTime(`❌ [changeProjectOwnerService] Failed to create stakeholder: ${createResult.message}`);
        return {
          success: false,
          message: createResult.message
        };
      }
    } else if (existingStakeholder.role !== ProjectRoleTypes.OWNER) {
      // ── If stakeholder exists but not OWNER: update role ────────────────────
      logWithTime(`[changeProjectOwnerService] Updating stakeholder role to OWNER for userId ${userId}`);
      const updateResult = await updateStakeholderService(existingStakeholder, project, {
        role: ProjectRoleTypes.OWNER,
        updatedBy: changedBy,
        auditContext
      });

      if (!updateResult.success) {
        logWithTime(`❌ [changeProjectOwnerService] Failed to update stakeholder: ${updateResult.message}`);
        return {
          success: false,
          message: updateResult.message
        };
      }
    }

    // ── Step 4: Update previous owner's role (if they are a stakeholder) ────
    const prevOwnerStakeholder = await StakeholderModel.findOne({
      userId: project.ownerId,
      projectId: project._id,
      isDeleted: false
    });

    if (prevOwnerStakeholder) {
      logWithTime(`[changeProjectOwnerService] Updating previous owner ${project.ownerId} role to ${prevOwnerNewRole}`);
      const prevOwnerUpdateResult = await updateStakeholderService(prevOwnerStakeholder, project, {
        role: prevOwnerNewRole,
        updatedBy: changedBy,
        auditContext
      });

      if (!prevOwnerUpdateResult.success) {
        logWithTime(`❌ [changeProjectOwnerService] Failed to update previous owner stakeholder role: ${prevOwnerUpdateResult.message}`);
        return {
          success: false,
          message: prevOwnerUpdateResult.message
        };
      }
    } else {
      logWithTime(`⚠️ [changeProjectOwnerService] Previous owner ${project.ownerId} is not a stakeholder, skipping role update`);
    }

    // ── Step 5: Update project.ownerId ───────────────────────────────────────
    const oldProject = project.toObject ? project.toObject() : { ...project };

    const updatePayload = {
      ownerId: userId,
      updatedBy: changedBy,
      ownerChangeReasonType: changeOwnerReasonType,
      ownerChangeReasonDescription: ownerChangeReasonDescription || null
    };

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      project._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Step 6: Log activity tracker ───────────────────────────────────────
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldProject, updatedProject);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CHANGE_PROJECT_OWNER,
      `Project owner changed to ${userId} by ${changedBy}. Reason: ${changeOwnerReasonType}${ownerChangeReasonDescription ? ` - ${ownerChangeReasonDescription}` : ''}`,
      {
        oldData,
        newData,
        adminActions: { targetId: project._id?.toString() }
      }
    );

    logWithTime(`✅ [changeProjectOwnerService] Project owner changed successfully from ${project.ownerId} to ${userId}`);
    return { success: true, project: updatedProject };

  } catch (error) {
    logWithTime(`❌ [changeProjectOwnerService] Unexpected error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while changing project owner", error: error.message };
  }
};

module.exports = { changeProjectOwnerService };
