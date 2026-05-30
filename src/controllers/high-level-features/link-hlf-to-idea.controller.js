// controllers/high-level-features/link-hlf-to-idea.controller.js

const { linkHlfToIdeaService } = require("@services/high-level-features/link-hlf-to-idea.service");
const { sendHlfUpdatedSuccess } = require("@/responses/success/hlf.response");

const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  throwBadRequestError,
  throwAccessDeniedError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { FORBIDDEN } = require("@/configs/http-status.config");

const linkHlfToIdeaController = async (req, res) => {
  try {
    const linkedBy = req.admin.adminId;

    const hlf = req.hlf;
    const idea = req.idea;
    const project = req.project;

    // ── Call service ──────────────────────────────────────
    const result = await linkHlfToIdeaService({
      hlf,
      idea,
      project,
      linkedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.errorCode === FORBIDDEN) {
        logWithTime(`🚫 [linkHlfToIdeaController] Access denied: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwAccessDeniedError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [linkHlfToIdeaController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [linkHlfToIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    if (result.message === "HLF is already linked to this idea. No changes made.") {
      logWithTime(`⚠️ [linkHlfToIdeaController] Already linked | ${getLogIdentifiers(req)}`);
      return sendHlfUpdatedSuccess(res, result.hlf);
    }

    logWithTime(`✅ [linkHlfToIdeaController] High-level feature linked to idea successfully | ${getLogIdentifiers(req)}`);
    return sendHlfUpdatedSuccess(res, result.hlf);

  } catch (error) {
    logWithTime(`❌ [linkHlfToIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { linkHlfToIdeaController };
