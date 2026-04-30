// controllers/requirements/revert-to-draft.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwAccessDeniedError,
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementRevertedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, FORBIDDEN } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/revert-to-draft
 * Revert requirement back to DRAFT.
 * Allowed from DRAFT, UNDER_REVIEW, or ISSUED statuses.
 * Supports all three phases: Elicitation, Elaboration, Negotiation.
 */
const revertToDraftController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { phase } = req.body;
    const { project, elicitation, elaboration, negotiation } = req;

    logWithTime(
      `📍 [revertToDraftController] Reverting requirement to DRAFT: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await requirementServices.revertToDraftService({
      requirementId,
      project,
      elicitation,
      elaboration,
      negotiation,
      phase: phase || null,
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
          `❌ [revertToDraftController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [revertToDraftController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot revert to draft");
      }
      logWithTime(`❌ [revertToDraftController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [revertToDraftController] Requirement reverted successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementRevertedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [revertToDraftController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { revertToDraftController };
