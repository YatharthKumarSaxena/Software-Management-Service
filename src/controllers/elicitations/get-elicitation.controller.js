// controllers/elicitations/get-elicitation.controller.js

const { elicitationServices } = require("@services/elicitations");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendElicitationFetchedSuccess } = require("@/responses/success/elicitation.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * GET /projects/:projectId/elicitations/:elicitationId
 * Retrieve a single elicitation by ID.
 */
const getElicitationController = async (req, res) => {
  try {
    const { elicitation } = req;

    logWithTime(
      `📍 [getElicitationController] Retrieving elicitation: ${elicitation._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await elicitationServices.getElicitationService(elicitation);

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [getElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [getElicitationController] Elicitation retrieved successfully | ${getLogIdentifiers(req)}`);
    return sendElicitationFetchedSuccess(res, result.elicitation);

  } catch (error) {
    logWithTime(`❌ [getElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getElicitationController };
