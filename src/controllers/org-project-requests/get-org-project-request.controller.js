// controllers/clients/org-project-requests/get-org-project-request.controller.js

const { getOrgProjectRequestService } = require("@services/org-project-requests");
const { logWithTime } = require("@utils/time-stamps.util");
const { getLogIdentifiers } = require("@responses/common/error-handler.response");
const { sendOrgProjectRequestFetchedSuccess } = require("@responses/success/org-project-request.response");
const {
  throwBadRequestError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwAccessDeniedError
} = require("@responses/common/error-handler.response");
const { CONFLICT, BAD_REQUEST, NOT_FOUND } = require("@configs/http-status.config");

/**
 * GET /org-project-requests/:requestId
 * Get a single org project request
 */
const getOrgProjectRequestController = async (req, res) => {
  try {
    logWithTime(`[getOrgProjectRequestController] Fetching request: ${req.orgProjectRequest._id}`);

    const request = req.orgProjectRequest;
    const clientId = req.clientId || req.user?.clientId;
    const adminId = req.adminId || req.user?.adminId;

    const result = await getOrgProjectRequestService({
      request,
      requesterClientId: clientId,
      requesterAdminId: adminId
    });

    if (!result.success) {
      logWithTime(
        `❌ [getOrgProjectRequestController] ${result.message} | ${getLogIdentifiers(req)}`
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
      `✅ [getOrgProjectRequestController] Request fetched successfully | ${getLogIdentifiers(req)}`
    );
    return sendOrgProjectRequestFetchedSuccess(res, result.request);

  } catch (error) {
    logWithTime(
      `❌ [getOrgProjectRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { getOrgProjectRequestController };
