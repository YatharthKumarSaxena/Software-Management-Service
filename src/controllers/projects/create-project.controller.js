// controllers/projects/create-project.controller.js

const { createProjectService } = require("@services/projects/create-project.service");
const { sendProjectCreatedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Create Project
 *
 * @route  POST /software-management-service/api/v1/admin/projects
 * @access Private – Admin (CEO / Business Analyst)
 *
 * @body {string} name             - Project name
 * @body {string} description      - Project description
 * @body {string} problemStatement - Problem statement
 * @body {string} goal             - Project goal
 *
 * @returns {201} Project created successfully
 * @returns {400} Missing / invalid fields
 * @returns {500} Internal server error
 */
const createProjectController = async (req, res) => {
  try {
    const {
      name, description, problemStatement, goal,
      projectCreationReasonType,
      projectCreationReasonDescription,
      projectCategory,
      expectedBudget,
      expectedTimelineInDays,
      orgIds,
      linkedProjectIds,
      projectComplexity,
      projectCriticality,
      projectPriority
    } = req.body;

    // ── Derive createdBy from authenticated admin ────────────────────
    const createdBy = req.admin.adminId;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await createProjectService({
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
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {

      if (result.message === "Validation error") {
        logWithTime(`❌ [createProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }

      if (result.message === "projectCategory is required") {
        logWithTime(`❌ [createProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message?.includes("projectCategory must be one of")) {
        logWithTime(`❌ [createProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "orgIds must be an array with exactly one entry for an organization project") {
        logWithTime(`❌ [createProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "orgIds array with at least one entry is required for a multi-organization project") {
        logWithTime(`❌ [createProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Every entry in orgIds must be a valid MongoDB ObjectId string") {
        logWithTime(`❌ [createProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (
        result.message === "addedLinkedProjectIds must be an array of MongoDB ObjectId strings" ||
        result.message === "addedLinkedProjectIds contains invalid MongoDB ObjectId values" ||
        result.message === "One or more linked projects do not exist" ||
        result.message === "Only active, non-archived, non-deleted projects can be linked" ||
        result.message === "A project cannot be linked to itself" ||
        result.message === "Linking these projects would create a circular reference"
      ) {
        logWithTime(`❌ [createProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      logWithTime(`❌ [createProjectController] ${result.message} | detail: ${result.error || "N/A"} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Success ───────────────────────────────────────────────────────
    logWithTime(`✅ [createProjectController] Project created successfully | ${getLogIdentifiers(req)}`);
    return sendProjectCreatedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [createProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createProjectController };
