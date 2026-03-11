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
    } = req.body;

    // ── Derive createdBy from authenticated admin ────────────────────
    const createdBy = req.admin.adminId;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await createProjectService({
      name,
      description,
      problemStatement,
      goal,
      createdBy,
      projectCreationReasonType,
      projectCreationReasonDescription,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Validation error") {
        logWithTime(`❌ [createProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [createProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
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
