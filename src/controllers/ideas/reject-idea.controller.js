// controllers/ideas/reject-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaRejectedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /ideas/:ideaId/reject
 * Reject an idea with reason (change status from PENDING to REJECTED).
 */
const rejectIdeaController = async (req, res) => {
  try {
    const { rejectedReasonType, notAcceptedReasonDescription } = req.body;
    const { idea } = req;

    logWithTime(
      `📍 [rejectIdeaController] Rejecting idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.rejectIdeaService(
      idea,
      {
        rejectedReasonType,
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
      logWithTime(`❌ [rejectIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [rejectIdeaController] Idea rejected successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaRejectedSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [rejectIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { rejectIdeaController };
