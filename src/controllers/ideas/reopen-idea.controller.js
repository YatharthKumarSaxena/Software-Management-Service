// controllers/ideas/reopen-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaReopenedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /ideas/:ideaId/reopen
 * Reopen an idea (change status from REJECTED/DEFERRED back to PENDING).
 */
const reopenIdeaController = async (req, res) => {
  try {
    const { idea } = req;

    logWithTime(
      `📍 [reopenIdeaController] Reopening idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.reopenIdeaService(
      idea,
      {
        reopenedBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [reopenIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [reopenIdeaController] Idea reopened successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaReopenedSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [reopenIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { reopenIdeaController };
