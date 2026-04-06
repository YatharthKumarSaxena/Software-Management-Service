// controllers/clients/org-project-requests/update-org-project-request.controller.js

const { updateOrgProjectRequestService } = require("@services/org-project-requests");
const { logWithTime } = require("@utils/time-stamps.util");
const { getLogIdentifiers } = require("@responses/common/error-handler.response");
const { sendOrgProjectRequestUpdatedSuccess } = require("@responses/success/org-project-request.response");
const {
  throwBadRequestError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwAccessDeniedError
} = require("@responses/common/error-handler.response");
const { CONFLICT, BAD_REQUEST, NOT_FOUND } = require("@configs/http-status.config");

/**
 * PATCH /org-project-requests/:requestId
 * Update an org project request (client only, only when PENDING)
 */
const updateOrgProjectRequestController = async (req, res) => {
  try {
    logWithTime(`[updateOrgProjectRequestController] Updating request: ${req.orgProjectRequest._id}`);

    const request = req.orgProjectRequest;
    const { requestDescription } = req.body;
    const clientId = req.clientId || req.user?.clientId;

    const result = await updateOrgProjectRequestService({
      request,
      clientId,
      requestDescription
    });

    if (!result.success) {
      logWithTime(
        `❌ [updateOrgProjectRequestController] ${result.message} | ${getLogIdentifiers(req)}`
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
      `✅ [updateOrgProjectRequestController] Request updated successfully | ${getLogIdentifiers(req)}`
    );
    return sendOrgProjectRequestUpdatedSuccess(res, result.request);

  } catch (error) {
    logWithTime(
      `❌ [updateOrgProjectRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateOrgProjectRequestController };
