// controllers/ideas/get-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendIdeaFetchedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { TotalTypes } = require("@configs/enums.config");

/**
 * GET /ideas/:ideaId
 * Retrieve a single idea by ID.
 */
const getIdeaController = async (req, res) => {
  try {
    const { idea } = req;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    logWithTime(
      `📍 [getIdeaController] Retrieving idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.getIdeaService({
      idea,
      selectFields: filters.selectFields,
      userType
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [getIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [getIdeaController] Idea retrieved successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaFetchedSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ [getIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getIdeaController };
