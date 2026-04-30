// controllers/requirements/issue-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwAccessDeniedError,
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementIssuedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, FORBIDDEN } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/issued
 * Mark requirement as ISSUED with decision reasons (problem identified).
 */
const issueRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { reasonType, reasonDescription, phase } = req.body;
    const { project, elicitation, elaboration, negotiation } = req;

    logWithTime(
      `📍 [issueRequirementController] Marking requirement as issued: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await requirementServices.issueRequirementService({
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
          `❌ [issueRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [issueRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot mark requirement as issued");
      }
      logWithTime(`❌ [issueRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [issueRequirementController] Requirement issued successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementIssuedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [issueRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { issueRequirementController };
