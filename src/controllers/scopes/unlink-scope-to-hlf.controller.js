// controllers/scopes/unlink-scope-to-hlf.controller.js

const { unlinkScopeToHlfService } = require("@services/scopes/unlink-scope-to-hlf.service");
const { sendScopeUnlinkedSuccess } = require("@/responses/success/scope.response");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /scopes/unlink/:scopeId
 * Unlink a scope from an HLF feature.
 */
const unlinkScopeToHlfController = async (req, res) => {
  try {
    const { scope, inception } = req;

    logWithTime(
      `📍 [unlinkScopeToHlfController] Unlinking scope ${scope._id} from HLF | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await unlinkScopeToHlfService({
      scope,
      inception,
      unlinkedBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(
        `❌ [unlinkScopeToHlfController] ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwConflictError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [unlinkScopeToHlfController] Scope unlinked from HLF successfully | ${getLogIdentifiers(req)}`);
    return sendScopeUnlinkedSuccess(res, result.scope);

  } catch (error) {
    logWithTime(`❌ [unlinkScopeToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { unlinkScopeToHlfController };
