// controllers/requirements/assign-collaborators-to-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwConflictError,
  throwInternalServerError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendRequirementUpdatedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND, BAD_REQUEST } = require("@configs/http-status.config");

/**
 * POST /requirements/:requirementId/assign-collaborator
 * Assign a collaborator (contributor) to a requirement.
 * Only admin stakeholders can be assigned as collaborators.
 */
const assignCollaboratorsToRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return throwBadRequestError(res, "userId is required");
    }

    logWithTime(
      `📍 [assignCollaboratorsToRequirementController] Assigning collaborator ${userId} to requirement ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const result = await requirementServices.assignContributorService({
      requirementId,
      userId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(
          `❌ [assignCollaboratorsToRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwDBResourceNotFoundError(res, result.message);
      }
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(
          `❌ [assignCollaboratorsToRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwBadRequestError(res, result.message);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [assignCollaboratorsToRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot assign collaborator");
      }
      logWithTime(`❌ [assignCollaboratorsToRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [assignCollaboratorsToRequirementController] Collaborator assigned successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementUpdatedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [assignCollaboratorsToRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { assignCollaboratorsToRequirementController };
