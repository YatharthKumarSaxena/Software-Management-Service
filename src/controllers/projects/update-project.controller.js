// controllers/projects/update-project.controller.js

const { updateProjectService } = require("@services/projects/update-project.service");
const { sendProjectUpdatedSuccess } = require("@/responses/success/project.response");
const {
  throwMissingFieldsError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");

/**
 * Controller: Update Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/projects/:projectId
 * @access Private – Admin (CEO / Business Analyst / Manager)
 *
 * @params {string} projectId       - MongoDB ObjectId of the project to update
 * @body   {string} [name]          - Updated project name
 * @body   {string} [description]   - Updated description
 * @body   {string} [problemStatement] - Updated problem statement
 * @body   {string} [goal]          - Updated goal
 *
 * At least one of the body fields must be provided.
 *
 * @returns {200} Project updated successfully
 * @returns {400} Missing projectId or no updatable fields provided
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const updateProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    // ── Validate route param ──────────────────────────────────────────
    if (!projectId) {
      return throwMissingFieldsError(res, ["projectId"]);
    }

    // ── Ensure at least one updatable field is present ───────────────
    const { name, description, problemStatement, goal, projectUpdationReason } = req.body;
    const hasUpdate = name || description || problemStatement || goal;

    if (!hasUpdate) {
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
      projectUpdationReason,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Project not found") {
        return throwDBResourceNotFoundError(res, "Project");
      }
      if (result.message === "Validation error") {
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logMiddlewareError("updateProject", result.message, req);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Success ───────────────────────────────────────────────────────
    return sendProjectUpdatedSuccess(res, result.project);
  } catch (error) {
    logMiddlewareError("updateProject", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateProjectController };
