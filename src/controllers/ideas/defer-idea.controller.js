// controllers/ideas/defer-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaDeferredSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /ideas/:ideaId/defer
 * Defer an idea with reason (change status from PENDING to DEFERRED).
 */
const deferIdeaController = async (req, res) => {
  try {
    const { deferredReasonType, notAcceptedReasonDescription } = req.body;
    const { idea } = req;

    logWithTime(
      `📍 [deferIdeaController] Deferring idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.deferIdeaService(
      idea,
      {
        deferredReasonType,
        notAcceptedReasonDescription,
        decidedBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [deferIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [deferIdeaController] Idea deferred successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaDeferredSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [deferIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deferIdeaController };
