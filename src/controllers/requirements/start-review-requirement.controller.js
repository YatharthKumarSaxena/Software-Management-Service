// controllers/requirements/start-review-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendRequirementTransitionedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");
const { RequirementStatuses } = require("@/configs/enums.config");

/**
 * PATCH /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/status
 * Update requirement status to UNDER_REVIEW.
 * Supports all three phases: Elicitation, Elaboration, Negotiation.
 */
const startReviewRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;

    const { project, elicitation, elaboration, negotiation } = req;

    const { phase } = req.body;

    logWithTime(
      `📍 [startReviewRequirementController] Starting review for requirement ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const result = await requirementServices.startReviewRequirementService({
      requirementId,
      project,
      phase: phase || null,
      elicitation,
      elaboration,
      negotiation,
      updatedBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [startReviewRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(`❌ [startReviewRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [startReviewRequirementController] Review started successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementTransitionedSuccess(res, result.requirement, RequirementStatuses.UNDER_REVIEW);

  } catch (error) {
    logWithTime(`❌ [startReviewRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { startReviewRequirementController };
