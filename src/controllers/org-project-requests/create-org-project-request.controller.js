// controllers/clients/org-project-requests/create-org-project-request.controller.js

const { createOrgProjectRequestService } = require("@services/org-project-requests");
const { logWithTime } = require("@utils/time-stamps.util");
const { getLogIdentifiers } = require("@responses/common/error-handler.response");
const {
  sendOrgProjectRequestCreatedSuccess,
  sendOrgProjectRequestUpdatedSuccess,
  sendOrgProjectRequestApprovedSuccess,
  sendOrgProjectRequestRejectedSuccess,
  sendOrgProjectRequestWithdrawnSuccess,
  sendOrgProjectRequestFetchedSuccess,
  sendOrgProjectRequestsListSuccess
} = require("@responses/success/org-project-request.response");
const {
  throwBadRequestError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwAccessDeniedError
} = require("@responses/common/error-handler.response");
const { CONFLICT, BAD_REQUEST, NOT_FOUND } = require("@configs/http-status.config");

/**
 * POST /org-project-requests
 * Create a new org project request
 */
const createOrgProjectRequestController = async (req, res) => {
  try {
    logWithTime(`[createOrgProjectRequestController] Creating org project request`);

    const { organizationId } = req.body;
    const clientId = req.clientId || req.user?.clientId;

    const project = req.project;

    const result = await createOrgProjectRequestService({
      project,
      organizationId,
      clientId
    });

    if (!result.success) {
      logWithTime(
        `❌ [createOrgProjectRequestController] ${result.message} | ${getLogIdentifiers(req)}`
      );
      if (result.errorCode === CONFLICT) {
        return throwConflictError(res, result.message, "Please try again");
      }
      if (result.errorCode === NOT_FOUND) {
        return throwDBResourceNotFoundError(res, "Organization Project Request");
      }
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message, "Invalid request");
      }
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(
      `✅ [createOrgProjectRequestController] Request created successfully | ${getLogIdentifiers(req)}`
    );
    return sendOrgProjectRequestCreatedSuccess(res, result.request);

  } catch (error) {
    logWithTime(
      `❌ [createOrgProjectRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { createOrgProjectRequestController };
