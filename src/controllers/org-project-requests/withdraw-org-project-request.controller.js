// controllers/clients/org-project-requests/withdraw-org-project-request.controller.js

const { withdrawOrgProjectRequestService } = require("@services/org-project-requests");
const { logWithTime } = require("@utils/time-stamps.util");
const { getLogIdentifiers } = require("@responses/common/error-handler.response");
const { sendOrgProjectRequestWithdrawnSuccess } = require("@responses/success/org-project-request.response");
const {
  throwBadRequestError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwAccessDeniedError
} = require("@responses/common/error-handler.response");
const { CONFLICT, BAD_REQUEST, NOT_FOUND } = require("@configs/http-status.config");

/**
 * PATCH /org-project-requests/:requestId/withdraw
 * Withdraw an org project request (client only, only when PENDING)
 */
const withdrawOrgProjectRequestController = async (req, res) => {
  try {
    logWithTime(`[withdrawOrgProjectRequestController] Withdrawing request: ${req.orgProjectRequest._id}`);

    const request = req.orgProjectRequest;
    const clientId = req.clientId || req.user?.clientId;

    const result = await withdrawOrgProjectRequestService({
      request,
      clientId
    });

    if (!result.success) {
      logWithTime(
        `❌ [withdrawOrgProjectRequestController] ${result.message} | ${getLogIdentifiers(req)}`
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
      `✅ [withdrawOrgProjectRequestController] Request withdrawn successfully | ${getLogIdentifiers(req)}`
    );
    return sendOrgProjectRequestWithdrawnSuccess(res, result.request);

  } catch (error) {
    logWithTime(
      `❌ [withdrawOrgProjectRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { withdrawOrgProjectRequestController };
