// controllers/requirements/unassign-collaborator.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwConflictError,
  throwInternalServerError,
  throwBadRequestError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendRequirementUpdatedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

/**
 * POST /requirements/:requirementId/unassign-collaborator
 * Unassign a collaborator (contributor) from a requirement.
 * Removes the user from the collaborators array.
 */
const unassignCollaboratorController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return throwBadRequestError(res, "userId is required");
    }

    logWithTime(
      `📍 [unassignCollaboratorController] Unassigning collaborator ${userId} from requirement ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const result = await requirementServices.unassignContributorService({
      requirementId,
      userId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [unassignCollaboratorController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot unassign collaborator");
      }
      logWithTime(`❌ [unassignCollaboratorController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [unassignCollaboratorController] Collaborator unassigned successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementUpdatedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [unassignCollaboratorController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { unassignCollaboratorController };
