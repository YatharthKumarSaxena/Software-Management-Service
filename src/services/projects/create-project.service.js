// services/projects/create-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");

/**
 * Creates a new project document in the database.
 *
 * Activity tracking lives here so that any caller (HTTP controller,
 * internal service-to-service call, admin panel, etc.) automatically
 * gets it without duplicating the logic.
 *
 * @param {Object} params
 * @param {string} params.name              - Project name
 * @param {string} params.description       - Project description
 * @param {string} params.problemStatement  - Problem statement
 * @param {string} params.goal              - Project goal
 * @param {string} params.createdBy         - Admin USR ID who is creating the project
 * @param {Object} params.auditContext      - Context needed for activity tracking
 * @param {Object} params.auditContext.admin     - Authenticated admin object  (req.admin)
 * @param {Object} params.auditContext.device    - Device object               (req.device)
 * @param {string} params.auditContext.requestId - Request ID                  (req.requestId)
 *
 * @returns {Object} { success: true, project } | { success: false, message, error? }
 */
const createProjectService = async ({
  name,
  description,
  problemStatement,
  goal,
  createdBy,
  projectCreationReason,
  auditContext,
}) => {
  try {
    const project = await ProjectModel.create({
      name,
      description,
      problemStatement,
      goal,
      createdBy,
      projectCreationReason,
      // version defaults to "v1.0" as per schema
    });

    // ── Fire-and-forget: activity tracking ──────────────────────────
    const { admin, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      admin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_PROJECT,
      `Project '${project.name}' (${project._id}) created by ${createdBy}`,
      { newData: project }
    );

    return { success: true, project };
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
      message: "Internal error while creating project",
      error: error.message,
    };
  }
};

module.exports = { createProjectService };
