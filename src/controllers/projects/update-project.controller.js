// controllers/projects/update-project.controller.js

const { updateProjectService } = require("@services/projects/update-project.service");
const { sendProjectUpdatedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK } = require("@/configs/http-status.config");

/**
 * Controller: Update Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/update-project/:projectId
 * @access Private – Admin (CEO / Business Analyst / Manager)
 *
 * @params {string} projectId                         - MongoDB ObjectId of the project
 * @body   {string} [name]                            - Updated project name
 * @body   {string} [description]                     - Updated description
 * @body   {string} [problemStatement]               - Updated problem statement
 * @body   {string} [goal]                            - Updated goal
 * @body   {string} projectUpdationReasonType         - Enum: why the project is being updated (required)
 * @body   {string} [projectUpdationReasonDescription] - Optional free-text elaboration
 *
 * At least one of name/description/problemStatement/goal must be provided.
 * Blocked if project is soft-deleted or status is COMPLETED.
 *
 * @returns {200} Project updated successfully
 * @returns {400} No updatable fields / no actual changes / project locked
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */

const updateProjectController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai

    // ── Ensure at least one updatable field is present ───────────────
    const {
      name, description, problemStatement, goal, expectedBudget, expectedTimelineInDays,
      projectUpdationReasonType,
      projectUpdationReasonDescription,
      addedOrgIds,
      removedOrgIds,
      addedLinkedProjectIds,
      removedLinkedProjectIds,
      projectComplexity,
      projectCriticality,
      projectPriority
    } = req.body;

    const hasUpdate =
      name ||
      description ||
      problemStatement ||
      goal ||
      expectedBudget !== undefined ||
      expectedTimelineInDays !== undefined ||
      (Array.isArray(addedOrgIds) && addedOrgIds.length) ||
      (Array.isArray(removedOrgIds) && removedOrgIds.length) ||
      (Array.isArray(addedLinkedProjectIds) && addedLinkedProjectIds.length) ||
      (Array.isArray(removedLinkedProjectIds) && removedLinkedProjectIds.length) ||
      projectComplexity !== undefined ||
      projectCriticality !== undefined ||
      projectPriority !== undefined;

    if (!hasUpdate) {
      logWithTime(`❌ [updateProjectController] No updatable fields provided | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(
        res,
        "No updatable fields provided",
        "Provide at least one of: name, description, problemStatement, goal, expectedBudget, expectedTimelineInDays, addedOrgIds, removedOrgIds, addedLinkedProjectIds, removedLinkedProjectIds, projectComplexity, projectCriticality, projectPriority."
      );
    }

    const updatedBy = req.admin.adminId;

    const result = await updateProjectService(project, {
      name,
      description,
      problemStatement,
      goal,
      expectedBudget,
      expectedTimelineInDays,
      addedOrgIds: addedOrgIds || [],
      removedOrgIds: removedOrgIds || [],
      addedLinkedProjectIds: addedLinkedProjectIds || [],
      removedLinkedProjectIds: removedLinkedProjectIds || [],
      updatedBy,
      projectUpdationReasonType,
      projectUpdationReasonDescription,
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

      if (result.message?.startsWith("Cannot update a")) {
        logWithTime(`❌ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.message);
      }

      if (result.message?.includes("Data integrity violation")) {
        logWithTime(`❌ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message?.includes("Organization association cannot be modified")) {
        logWithTime(`❌ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [updateProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }

      if (result.message?.includes("must retain at least one organisation")) {
        logWithTime(`❌ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (
        result.message === "addedLinkedProjectIds must be an array of MongoDB ObjectId strings" ||
        result.message === "addedLinkedProjectIds contains invalid MongoDB ObjectId values" ||
        result.message === "removedLinkedProjectIds must be an array of MongoDB ObjectId strings" ||
        result.message === "removedLinkedProjectIds contains invalid MongoDB ObjectId values" ||
        result.message === "One or more linked projects do not exist" ||
        result.message === "Only active, non-archived, non-deleted projects can be linked" ||
        result.message === "A project cannot be linked to itself" ||
        result.message === "Linking these projects would create a circular reference"
      ) {
        logWithTime(`❌ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      logWithTime(`❌ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    if (result.success && !result.project) {
      logWithTime(`ℹ️ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return res.status(OK).json({
        success: true,
        message: result.message,
      });
    }

    // ── Success ───────────────────────────────────────────────────────
    logWithTime(`✅ [updateProjectController] Project updated successfully | ${getLogIdentifiers(req)}`);
    return sendProjectUpdatedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [updateProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateProjectController };
