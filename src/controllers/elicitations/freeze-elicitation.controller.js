// controllers/elicitations/freeze-elicitation.controller.js

const { elicitationServices } = require("@services/elicitations");
const {
  throwSpecificInternalServerError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendElicitationFrozenSuccess } = require("@/responses/success/elicitation.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /projects/:projectId/elicitations/freeze/:elicitationId
 * Freeze an elicitation (mark as isFrozen = true).
 * Only Project Owner can access this.
 */
const freezeElicitationController = async (req, res) => {
  try {
    const { elicitation } = req;

    logWithTime(
      `📍 [freezeElicitationController] Freezing elicitation: ${elicitation._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await elicitationServices.freezeElicitationService(
      elicitation,
      {
        frozenBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [freezeElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [freezeElicitationController] Elicitation frozen successfully | ${getLogIdentifiers(req)}`);
    return sendElicitationFrozenSuccess(res, result.elicitation);

  } catch (error) {
    logWithTime(`❌ [freezeElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { freezeElicitationController };
