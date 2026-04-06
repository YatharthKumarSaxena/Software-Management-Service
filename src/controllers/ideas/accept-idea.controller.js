// controllers/ideas/accept-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaAcceptedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /ideas/:ideaId/accept
 * Accept an idea (change status from PENDING to ACCEPTED).
 */
const acceptIdeaController = async (req, res) => {
  try {
    const { idea } = req;

    logWithTime(
      `📍 [acceptIdeaController] Accepting idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.acceptIdeaService(
      idea,
      {
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
      logWithTime(`❌ [acceptIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [acceptIdeaController] Idea accepted successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaAcceptedSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [acceptIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { acceptIdeaController };
