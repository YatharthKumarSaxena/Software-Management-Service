// controllers/requirements/list-collaborator.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendCollaboratorListSuccess } = require("@/responses/success/collaborator.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND } = require("@configs/http-status.config");

/**
 * GET /requirements/:requirementId/collaborators
 * List all collaborators of a requirement.
 * Admins see all collaborator info.
 * Clients see limited info (id, name only).
 */
const listCollaboratorController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const isAdmin = req.admin ? true : false;

    logWithTime(
      `📍 [listCollaboratorController] Fetching collaborators of requirement ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const result = await requirementServices.listCollaboratorsService({
      requirementId,
      isAdmin
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(
          `❌ [listCollaboratorController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwDBResourceNotFoundError(res, result.message);
      }
      logWithTime(`❌ [listCollaboratorController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listCollaboratorController] Collaborators fetched successfully | ${getLogIdentifiers(req)}`);
    return sendCollaboratorListSuccess(res, result.collaborators);

  } catch (error) {
    logWithTime(`❌ [listCollaboratorController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listCollaboratorController };
