// controllers/requirements/reject-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwAccessDeniedError,
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
  throwBadRequestError
} = require("@/responses/common/error-handler.response");
const { sendRequirementRejectedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, FORBIDDEN, BAD_REQUEST } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/reject
 * Reject requirement with decision reasons (final discard, no changes).
 * - Elicitation: Can reject DRAFT directly (no review needed)
 * - Elaboration & Negotiation: Must be UNDER_REVIEW
 */
const rejectRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { reasonType, reasonDescription, phase } = req.body;
    const { project, elicitation, elaboration, negotiation } = req;

    logWithTime(
      `📍 [rejectRequirementController] Rejecting requirement: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await requirementServices.rejectRequirementService({
      requirementId,
      project,
      elicitation,
      elaboration,
      negotiation,
      reasonType,
      reasonDescription,
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
          `❌ [rejectRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(
          `❌ [rejectRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwBadRequestError(res, result.message, { details: "Phase-specific status validation failed" });
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [rejectRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot reject requirement");
      }
      logWithTime(`❌ [rejectRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [rejectRequirementController] Requirement rejected successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementRejectedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [rejectRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { rejectRequirementController };
