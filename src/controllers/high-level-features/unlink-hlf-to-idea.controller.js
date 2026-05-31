// controllers/high-level-features/unlink-hlf-to-idea.controller.js

const { unlinkHlfFromIdeaService } = require("@services/high-level-features/unlink-hlf-to-idea.service");
const { sendHlfUnlinkedSuccess } = require("@/responses/success/hlf.response");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /high-level-features/unlink/:hlfId
 * Unlink a high-level feature from an idea.
 */
const unlinkHlfFromIdeaController = async (req, res) => {
  try {
    const { hlf, project } = req;

    logWithTime(
      `📍 [unlinkHlfFromIdeaController] Unlinking HLF ${hlf._id} from Idea | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await unlinkHlfFromIdeaService({
      hlf,
      project,
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
        `❌ [unlinkHlfFromIdeaController] ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwConflictError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [unlinkHlfFromIdeaController] HLF unlinked from Idea successfully | ${getLogIdentifiers(req)}`);
    return sendHlfUnlinkedSuccess(res, result.message, result.hlf);

  } catch (error) {
    logWithTime(`❌ [unlinkHlfFromIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { unlinkHlfFromIdeaController };
