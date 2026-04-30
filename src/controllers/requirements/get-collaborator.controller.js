// controllers/requirements/get-collaborator.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendCollaboratorFetchSuccess } = require("@/responses/success/collaborator.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND } = require("@configs/http-status.config");

/**
 * GET /requirements/:requirementId/collaborator/:userId
 * Get a single collaborator of a requirement.
 * Admins see all collaborator info.
 * Clients see limited info (id, name only).
 */
const getCollaboratorController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { userId } = req.params;
    const isAdmin = req.admin ? true : false;

    logWithTime(
      `📍 [getCollaboratorController] Fetching collaborator ${userId} of requirement ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const result = await requirementServices.getCollaboratorService({
      requirementId,
      userId,
      isAdmin
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(
          `❌ [getCollaboratorController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwDBResourceNotFoundError(res, result.message);
      }
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [getCollaboratorController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message);
      }
      logWithTime(`❌ [getCollaboratorController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getCollaboratorController] Collaborator fetched successfully | ${getLogIdentifiers(req)}`);
    return sendCollaboratorFetchSuccess(res, result.collaborator);

  } catch (error) {
    logWithTime(`❌ [getCollaboratorController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getCollaboratorController };
