// controllers/requirements/assign-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwConflictError,
  throwInternalServerError,
  throwBadRequestError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendRequirementAssignedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

const assignRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { userId, phase } = req.body;
    const { project, elicitation, elaboration, negotiation } = req;

    if (!userId) {
      return throwBadRequestError(res, "userId is required");
    }

    logWithTime(
      `📍 [assignRequirementController] Assigning requirement ${requirementId} to user ${userId} | ${getLogIdentifiers(req)}`
    );

    const result = await requirementServices.assignRequirementService({
      requirementId,
      userId,
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

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [assignRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(`❌ [assignRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [assignRequirementController] Requirement assigned successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementAssignedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [assignRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { assignRequirementController };
