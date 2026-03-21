const { ProjectModel, InceptionModel } = require("@models/index");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { generateVersion } = require("@/utils/version.util");
const { ProjectStatus, ProjectCategoryTypes } = require("@/configs/enums.config");
const { isValidMongoID } = require("@/utils/id-validators.util");
const {
  validateLinkedProjectIds
} = require("@/services/projects/linked-projects.service");
const { logWithTime } = require("@/utils/time-stamps.util");

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

    const shouldIncrementVersion =
      hasOrgChanges ||
      hasLinkedProjectChanges ||
      allowedFields.some(field =>
        updatePayload[field] !== undefined &&
        updatePayload[field] !== existingProject[field]
      );

    if (shouldIncrementVersion) {
      updatePayload.version = generateVersion(1, existingProject.version);
      // Fetch Inception Document
      const inceptionDoc = await InceptionModel.findOne({ projectId: existingProject._id });
      if (inceptionDoc) {
        // Update Inception Document with new version
        const version = generateVersion(inceptionDoc.cycleNumber, inceptionDoc.version);
        await InceptionModel.findByIdAndUpdate(
          inceptionDoc._id,
          { $set: { version, updatedBy: updates.updatedBy } },
          { new: true }
        );
        logWithTime(`[updateProjectService] Inception document for project ${existingProject._id} version updated to ${version}`);

        logActivityTrackerEvent(
          updates.auditContext?.user,
          updates.auditContext?.device,
          updates.auditContext?.requestId,
          ACTIVITY_TRACKER_EVENTS.UPDATE_INCEPTION,
          `Inception document version updated to ${version} due to project update for project ${existingProject._id}`,
          {
            newData: { version },
            adminActions: { targetId: inceptionDoc._id.toString() },
          }
        );
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
      { new: true, runValidators: true }
    );

    /* ───────── Activity Tracker ───────── */

    const { user, device, requestId } = updates.auditContext || {};

    const { oldData, newData } =
      prepareAuditData(existingProject, updatedProject);

    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_PROJECT,
      `Project '${updatedProject.name}' (${existingProject._id}) updated to ${updatedProject.version} by ${updates.updatedBy}`,
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