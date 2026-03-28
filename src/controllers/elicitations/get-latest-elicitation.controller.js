// controllers/elicitations/get-latest-elicitation.controller.js

const { elicitationServices } = require("@services/elicitations");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendLatestElicitationFetchedSuccess } = require("@/responses/success/elicitation.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * GET /projects/:projectId/elicitations/latest
 * Retrieve the latest elicitation for a project.
 */
const getLatestElicitationController = async (req, res) => {
  try {
    const { elicitation } = req;

    logWithTime(
      `📍 [getLatestElicitationController] Retrieving latest elicitation: ${elicitation._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await elicitationServices.getLatestElicitationService(
      elicitation
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [getLatestElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(
      `✅ [getLatestElicitationController] Latest elicitation retrieved successfully | ${getLogIdentifiers(req)}`
    );
    return sendLatestElicitationFetchedSuccess(res, result.elicitation);

  } catch (error) {
    logWithTime(`❌ [getLatestElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getLatestElicitationController };
