// controllers/ideas/list-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwInternalServerError,
  throwBadRequestError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeasListSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { TotalTypes } = require("@configs/enums.config");
const { BAD_REQUEST } = require("@configs/http-status.config");

/**
 * GET /ideas/list/:projectId
 * List all ideas for a project with pagination and filters.
 */
const listIdeasController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const filters = parseListFilters(req.query);

    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    logWithTime(
      `📍 [listIdeasController] Listing ideas for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.listIdeasService({
      projectId,
      filters,
      userType
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      logWithTime(`❌ [listIdeasController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response using the helper ──────────────────────
    logWithTime(
      `✅ [listIdeasController] Retrieved ${result.data.length} ideas (${result.pagination.totalCount} total) | ${getLogIdentifiers(req)}`
    );
    return sendIdeasListSuccess(res, {
      ideas: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    logWithTime(`❌ [listIdeasController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listIdeasController };
