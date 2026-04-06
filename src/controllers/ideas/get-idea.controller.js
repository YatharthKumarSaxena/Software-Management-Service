// controllers/ideas/get-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaFetchedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * GET /ideas/:ideaId
 * Retrieve a single idea by ID.
 */
const getIdeaController = async (req, res) => {
  try {
    const { idea } = req;

    logWithTime(
      `📍 [getIdeaController] Retrieving idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.getIdeaService(idea);

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [getIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [getIdeaController] Idea retrieved successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaFetchedSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [getIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getIdeaController };
