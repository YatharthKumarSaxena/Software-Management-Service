// services/projects/update-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");

/**
 * Increments the minor version segment of a version string.
 *   "v1.0" → "v1.1"  |  "v1.9" → "v1.10"
 *
 * @param {string} currentVersion - e.g. "v1.0"
 * @returns {string} next version string
 */
const incrementVersion = (currentVersion) => {
  const match = currentVersion.match(/^v(\d+)\.(\d+)$/);
  if (!match) return currentVersion; // Should not happen; keep as-is if format breaks

  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10) + 1;
  return `v${major}.${minor}`;
};

/**
 * Updates an existing project document.
 *
 * Only the fields actually supplied in `updates` are written to the DB.
 * The `version` is automatically incremented regardless of what other
 * fields are being changed.
 *
 * Activity tracking lives here so that any caller automatically gets it.
 *
 * @param {string} projectId - MongoDB ObjectId string of the target project
 * @param {Object} updates
 * @param {string} [updates.name]
 * @param {string} [updates.description]
 * @param {string} [updates.problemStatement]
 * @param {string} [updates.goal]
 * @param {string} updates.updatedBy       - Admin USR ID performing the update (required)
 * @param {Object} updates.auditContext    - Context needed for activity tracking
 * @param {Object} updates.auditContext.admin     - req.admin
 * @param {Object} updates.auditContext.device    - req.device
 * @param {string} updates.auditContext.requestId - req.requestId
 *
 * @returns {Object} { success: true, oldProject, project } | { success: false, message, error? }
 */
const updateProjectService = async (projectId, updates) => {
  try {
    // 1. Fetch current document (needed for audit + version increment)
    const existing = await ProjectModel.findById(projectId);

    if (!existing) {
      return { success: false, message: "Project not found" };
    }

    // 2. Build update payload — only include supplied fields
    const allowedFields = ["name", "description", "problemStatement", "goal"];
    const updatePayload = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updatePayload[field] = updates[field];
      }
    });

    // 3. Increment version
    updatePayload.version = incrementVersion(existing.version);

    // 4. Stamp updatedBy and updation reason
    updatePayload.updatedBy = updates.updatedBy;
    updatePayload.projectUpdationReason = updates.projectUpdationReason;

    // 5. Persist – { new: true } returns the updated document
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      projectId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ──────────────────────────
    const { admin, device, requestId } = updates.auditContext || {};
    const { oldData, newData } = prepareAuditData(existing, updatedProject);

    logActivityTrackerEvent(
      admin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_PROJECT,
      `Project '${updatedProject.name}' (${projectId}) updated to ${updatedProject.version} by ${updates.updatedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: projectId },
      }
    );

    return {
      success: true,
      oldProject: existing,
      project: updatedProject,
    };
  } catch (error) {
    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        error: error.message,
      };
    }

    return {
      success: false,
      message: "Internal error while updating project",
      error: error.message,
    };
  }
};

module.exports = { updateProjectService };
