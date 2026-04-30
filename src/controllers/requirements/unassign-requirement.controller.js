// controllers/requirements/unassign-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
  throwBadRequestError
} = require("@/responses/common/error-handler.response");
const { sendRequirementUnassignedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, BAD_REQUEST } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/unassign
 * Unassign a requirement from current assignee.
 * Supports all three phases: Elicitation, Elaboration, Negotiation.
 * Phase is NOT frozen.
 */
const unassignRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { userId, phase } = req.body;
    const { project, elicitation, elaboration, negotiation } = req;

    logWithTime(
      `📍 [unassignRequirementController] Unassigning requirement ${requirementId} from user ${userId} | ${getLogIdentifiers(req)}`
    );

    const result = await requirementServices.unassignRequirementService({
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
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(
          `❌ [unassignRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwBadRequestError(res, result.message);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [unassignRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(`❌ [unassignRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [unassignRequirementController] Requirement unassigned successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementUnassignedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [unassignRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { unassignRequirementController };
