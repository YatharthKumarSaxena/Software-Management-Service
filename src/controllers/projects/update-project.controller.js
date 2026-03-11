// controllers/projects/update-project.controller.js

const { updateProjectService } = require("@services/projects/update-project.service");
const { sendProjectUpdatedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

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
    const projectId = project._id.toString();

    // ── Ensure at least one updatable field is present ───────────────
    const {
      name, description, problemStatement, goal,
      projectUpdationReasonType,
      projectUpdationReasonDescription,
    } = req.body;

    const hasUpdate = name || description || problemStatement || goal;

    if (!hasUpdate) {
      logWithTime(`❌ [updateProjectController] No updatable fields provided | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(
        res,
        "No updatable fields provided",
        "Provide at least one of: name, description, problemStatement, goal."
      );
    }

    const updatedBy = req.admin.adminId;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await updateProjectService(projectId, {
      name,
      description,
      problemStatement,
      goal,
      updatedBy,
      projectUpdationReasonType,
      projectUpdationReasonDescription,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Project not found") {
        logWithTime(`❌ [updateProjectController] Project not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Project");
      }
      if (result.message?.startsWith("Cannot update a")) {
        logWithTime(`❌ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.message);
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [updateProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [updateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── No-op: service reports success:true but nothing actually changed ─
    if (result.message === "No changes detected, Project Document remains unchanged") {
      logWithTime(`❌ [updateProjectController] No changes detected | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(
        res,
        "No changes detected",
        "The submitted values are identical to the existing project details. Nothing was updated."
      );
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
