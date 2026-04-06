// controllers/ideas/create-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwInternalServerError,
  throwConflictError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaCreatedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/ideas
 * Create a new idea for a project.
 */
const createIdeaController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description } = req.body;

    logWithTime(
      `📍 [createIdeaController] Creating idea for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.createIdeaService({
      projectId,
      title,
      description,
      createdBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(
        `❌ [createIdeaController] ${result.message} | ${getLogIdentifiers(req)}`
      );

      // Handle specific error codes
      if (result.errorCode === CONFLICT) {
        return throwConflictError(res, result.message);
      }
      if (result.errorCode === NOT_FOUND) {
        return throwInternalServerError(res, new Error(result.message));
      }

      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [createIdeaController] Idea created successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaCreatedSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [createIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createIdeaController };
