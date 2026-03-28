// controllers/elicitations/list-elicitations.controller.js

const { elicitationServices } = require("@services/elicitations");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendElicitationsListSuccess } = require("@/responses/success/elicitation.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * GET /projects/:projectId/elicitations
 * List all elicitations for a project.
 */
const listElicitationsController = async (req, res) => {
  try {
    const { projectId } = req.params;

    logWithTime(
      `📍 [listElicitationsController] Listing elicitations for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await elicitationServices.listElicitationsService(projectId);

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [listElicitationsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(
      `✅ [listElicitationsController] Retrieved ${result.elicitations.length} elicitations | ${getLogIdentifiers(req)}`
    );
    return sendElicitationsListSuccess(res, result.elicitations);

  } catch (error) {
    logWithTime(`❌ [listElicitationsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listElicitationsController };
