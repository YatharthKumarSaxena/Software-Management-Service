// controllers/inceptions/freeze-inception.controller.js

const { inceptionServices } = require("@services/inceptions");
const {
  throwSpecificInternalServerError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendInceptionFrozenSuccess } = require("@/responses/success/inception.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /projects/:projectId/inceptions/freeze/:inceptionId
 * Freeze an inception (mark as isFrozen = true).
 * Only Project Owner can access this.
 */
const freezeInceptionController = async (req, res) => {
  try {
    const { inception } = req;

    logWithTime(
      `📍 [freezeInceptionController] Freezing inception: ${inception._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await inceptionServices.freezeInceptionService(
      inception,
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
      logWithTime(`❌ [freezeInceptionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [freezeInceptionController] Inception frozen successfully | ${getLogIdentifiers(req)}`);
    return sendInceptionFrozenSuccess(res, result.inception);

  } catch (error) {
    logWithTime(`❌ [freezeInceptionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { freezeInceptionController };
