// controllers/scopes/link-scope-to-hlf.controller.js

const { linkScopeToHlfService } = require("@services/scopes/link-scope-to-hlf.service");
const { sendScopeLinkedSuccess } = require("@/responses/success/scope.response");
const {
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { FORBIDDEN } = require("@/configs/http-status.config");

/**
 * PATCH /scopes/link/:scopeId/:hlfId
 * Link a scope to an HLF feature.
 */
const linkScopeToHlfController = async (req, res) => {
  try {
    const { scope, hlf, inception } = req;

    logWithTime(
      `📍 [linkScopeToHlfController] Linking scope ${scope._id} to HLF ${hlf._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await linkScopeToHlfService({
      scope,
      hlf,
      inception,
      featureId: hlf._id?.toString(),
      linkedBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      if (result.errorCode === FORBIDDEN) {
        logWithTime(
          `🚫 [linkScopeToHlfController] Access denied: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }

      logWithTime(
        `❌ [linkScopeToHlfController] ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [linkScopeToHlfController] Scope linked to HLF successfully | ${getLogIdentifiers(req)}`);
    return sendScopeLinkedSuccess(res,result.message, result.scope);

  } catch (error) {
    logWithTime(`❌ [linkScopeToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { linkScopeToHlfController };
