const { ProjectModel } = require("@models/index");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { manualVersionControlService } = require("@services/common/version.service");
const { ProjectStatus, ProjectCategoryTypes, Phases } = require("@/configs/enums.config");
const { isValidMongoID } = require("@/utils/id-validators.util");
const {
  validateLinkedProjectIds
} = require("@/services/projects/linked-projects.service");

const updateProjectService = async (existingProject, updates) => {
  try {

    /* ───────── Status Guard ───────── */

    const blockedStatuses = [ProjectStatus.COMPLETED, ProjectStatus.ABORTED];

    if (blockedStatuses.includes(existingProject.projectStatus)) {
      return {
        success: false,
        message: `Cannot update a ${existingProject.projectStatus} project`,
      };
    }

    /* ───────── Allowed Fields Update ───────── */

    const allowedFields = [
      "name",
      "description",
      "problemStatement",
      "goal",
      "expectedBudget",
      "expectedTimelineInDays",
      "projectComplexity",
      "projectCriticality",
      "projectPriority"
    ];

    const updatePayload = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updatePayload[field] = updates[field];
      }
    });

    /* ───────── Organization Handling ───────── */

    let hasOrgChanges = false;

    const existingOrgIds = (existingProject.orgIds || []).map(id => id.toString());

    const addedRaw = [...new Set((updates.addedOrgIds || []).map(id => id.toString()))]
      .filter(id => isValidMongoID(id));

    const removedRaw = [...new Set((updates.removedOrgIds || []).map(id => id.toString()))]
      .filter(id => isValidMongoID(id));

    const addedSet = new Set(addedRaw);
    const removedSet = new Set(removedRaw);

    const finalAdded = [...addedSet].filter(id => !removedSet.has(id));
    const finalRemoved = [...removedSet].filter(id => !addedSet.has(id));

    const currentSet = new Set(existingOrgIds);

    finalAdded.forEach(id => currentSet.add(id));
    finalRemoved.forEach(id => currentSet.delete(id));

    const finalOrgIds = [...currentSet];

    if (existingProject.projectCategory === ProjectCategoryTypes.INDIVIDUAL) {

      if (finalAdded.length) {
        return {
          success: false,
          message: "Data integrity violation: individual projects cannot contain organisations"
        };
      }

    }

    else if (existingProject.projectCategory === ProjectCategoryTypes.ORGANIZATION) {

      if (finalAdded.length || finalRemoved.length) {
        return {
          success: false,
          message: "Organization association cannot be modified for single-organization projects"
        };
      }

    }

    else if (existingProject.projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION) {

      if (finalOrgIds.length < 1) {
        return {
          success: false,
          message: "A multi-organization project must retain at least one organisation"
        };
      }

      if (finalAdded.length || finalRemoved.length) {
        updatePayload.orgIds = finalOrgIds;
        hasOrgChanges = true;
      }
    }

    /* ───────── Linked Project Validation ───────── */

    const linkedProjectsValidation = await validateLinkedProjectIds({
      projectId: existingProject._id,
      addedLinkedProjectIds: updates.addedLinkedProjectIds || [],
      removedLinkedProjectIds: updates.removedLinkedProjectIds || []
    });

    if (!linkedProjectsValidation.success) {
      return linkedProjectsValidation;
    }

    const addedIds = linkedProjectsValidation.addedLinkedProjectIds;
    const removedIds = linkedProjectsValidation.removedLinkedProjectIds;

    const existingLinkedProjectIds =
      (existingProject.linkedProjectIds || []).map(id => id.toString());

    const linkedIdsAfterRemoval =
      existingLinkedProjectIds.filter(id => !removedIds.includes(id));

    const finalLinkedProjectIds = [
      ...new Set([
        ...linkedIdsAfterRemoval,
        ...addedIds
      ])
    ];

    if (finalLinkedProjectIds.includes(existingProject._id.toString())) {
      return {
        success: false,
        message: "A project cannot be linked to itself"
      };
    }

    const existingLinkedSet = new Set(existingLinkedProjectIds);
    const finalLinkedSet = new Set(finalLinkedProjectIds);

    const hasLinkedProjectChanges =
      existingLinkedSet.size !== finalLinkedSet.size ||
      existingLinkedProjectIds.some(id => !finalLinkedSet.has(id));

    if (hasLinkedProjectChanges) {
      updatePayload.linkedProjectIds = finalLinkedProjectIds;
    }

    /* ───────── Detect Actual Changes ───────── */

    const hasActualChanges =
      hasOrgChanges ||
      hasLinkedProjectChanges ||
      allowedFields.some(field =>
        updatePayload[field] !== undefined &&
        updatePayload[field] !== existingProject[field]
      );

    if (!hasActualChanges) {
      return {
        success: true,
        message: "No changes detected, Project Document remains unchanged"
      };
    }

    /* ───────── Version Increment ───────── */

    const shouldImpactInception =
      updates.problemStatement !== undefined ||
      updates.goal !== undefined ||
      updates.expectedTimelineInDays !== undefined;

    if (hasActualChanges) {

      // ✅ Project version update (minor++)
      const currentVersion = existingProject.version || { major: 1, minor: 0 };

      updatePayload.version = {
        major: currentVersion.major,
        minor: currentVersion.minor + 1
      };

      // ✅ Phase version update (reuse service)
      if (shouldImpactInception) {
        await manualVersionControlService({
          projectId: existingProject._id,
          currentPhase: Phases.INCEPTION,
          action: "Project update impacting requirement phases",
          performedBy: updates.updatedBy,
          auditContext: updates.auditContext
        });
      }
    }

    updatePayload.updatedBy = updates.updatedBy;

    updatePayload.projectUpdationReasonType = updates.projectUpdationReasonType;

    updatePayload.projectUpdationReasonDescription =
      updates.projectUpdationReasonDescription || null;

    /* ───────── Persist Update ───────── */

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      existingProject._id,
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    );

    /* ───────── Activity Tracker ───────── */

    const { user, device, requestId } = updates.auditContext || {};

    const { oldData, newData } =
      prepareAuditData(existingProject, updatedProject);

    const versionString = `v${updatedProject.version.major}.${updatedProject.version.minor}`;

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_PROJECT,
      `Project '${updatedProject.name}' (${existingProject._id}) updated to ${versionString} by ${updates.updatedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: existingProject._id }
      }
    );

    return {
      success: true,
      oldProject: existingProject,
      project: updatedProject
    };

  }

  catch (error) {

    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        error: error.message
      };
    }

    return {
      success: false,
      message: "Internal error while updating project",
      error: error.message
    };
  }
};

module.exports = { updateProjectService };