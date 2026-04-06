// controllers/ideas/list-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeasListSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * GET /ideas/list/:projectId
 * List all ideas for a project with pagination.
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 */
const listIdeasController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    logWithTime(
      `📍 [listIdeasController] Listing ideas for project: ${projectId} (page: ${page}, limit: ${limit}) | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.listIdeasService({
      projectId,
      page,
      limit
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [listIdeasController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response using the helper ──────────────────────
    logWithTime(
      `✅ [listIdeasController] Retrieved ${result.ideas.length} ideas (${result.pagination.total} total) | ${getLogIdentifiers(req)}`
    );
    return sendIdeasListSuccess(res, {
      ideas: result.ideas,
      pagination: result.pagination
    });

  } catch (error) {
    logWithTime(`❌ [listIdeasController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listIdeasController };
