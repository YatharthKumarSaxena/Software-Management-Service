// controllers/requirements/update-requirement-status.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendRequirementUpdatedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

/**
 * PATCH /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/status
 * Update requirement status.
 */
const updateRequirementStatusController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { phase } = req.body;
    const { project, elicitation, elaboration, negotiation } = req;

    logWithTime(
      `📍 [updateRequirementStatusController] Transitioning requirement to review: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const result = await requirementServices.startReviewRequirementService({
      requirementId,
      project,
      elicitation,
      elaboration,
      negotiation,
      phase: phase || null,
      updatedBy: req.admin?.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [updateRequirementStatusController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(`❌ [updateRequirementStatusController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [updateRequirementStatusController] Status updated successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementUpdatedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [updateRequirementStatusController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateRequirementStatusController };
