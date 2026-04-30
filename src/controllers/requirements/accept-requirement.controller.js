// controllers/requirements/accept-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwAccessDeniedError,
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
  throwBadRequestError
} = require("@/responses/common/error-handler.response");
const { sendRequirementAcceptedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, FORBIDDEN, BAD_REQUEST } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/accept
 * Accept requirement (approves, final decision).
 * Only allowed in Elaboration and Negotiation phases (not Elicitation).
 */
const acceptRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { phase } = req.body;
    const { project, elaboration, negotiation } = req;

    logWithTime(
      `📍 [acceptRequirementController] Accepting requirement: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await requirementServices.acceptRequirementService({
      requirementId,
      project,
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
          `❌ [acceptRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(
          `❌ [acceptRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwBadRequestError(res, result.message, { details: "Phase-specific status validation failed" });
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [acceptRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot accept requirement");
      }
      logWithTime(`❌ [acceptRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [acceptRequirementController] Requirement accepted successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementAcceptedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [acceptRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { acceptRequirementController };
