// controllers/projects/create-project.controller.js

const { createProjectService } = require("@services/projects/create-project.service");
const { sendProjectCreatedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");

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
    const { name, description, problemStatement, goal, projectCreationReason } = req.body;

    // ── Derive createdBy from authenticated admin ────────────────────
    // (presence + validation already done by middleware before this point)
    const createdBy = req.admin.adminId;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await createProjectService({
      name,
      description,
      problemStatement,
      goal,
      createdBy,
      projectCreationReason,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Validation error") {
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logMiddlewareError("createProject", result.message, req);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Success ───────────────────────────────────────────────────────
    return sendProjectCreatedSuccess(res, result.project);
  } catch (error) {
    logMiddlewareError("createProject", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createProjectController };
