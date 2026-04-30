// controllers/requirements/revoke-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwAccessDeniedError,
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementRevokedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, FORBIDDEN } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/revoke
 * Revoke requirement (only ISSUED or ACCEPTED requirements can be revoked).
 * Supports Elaboration and Negotiation phases.
 */
const revokeRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { reasonType, reasonDescription, phase } = req.body;
    const { project, elaboration, negotiation } = req;

    logWithTime(
      `📍 [revokeRequirementController] Revoking requirement: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await requirementServices.revokeRequirementService({
      requirementId,
      project,
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
          `❌ [revokeRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [revokeRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot revoke requirement");
      }
      logWithTime(`❌ [revokeRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [revokeRequirementController] Requirement revoked successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementRevokedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [revokeRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { revokeRequirementController };
