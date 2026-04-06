// controllers/clients/org-project-requests/reject-org-project-request.controller.js

const { rejectOrgProjectRequestService } = require("@services/org-project-requests");
const { logWithTime } = require("@utils/time-stamps.util");
const { getLogIdentifiers } = require("@responses/common/error-handler.response");
const { sendOrgProjectRequestRejectedSuccess } = require("@responses/success/org-project-request.response");
const {
  throwBadRequestError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwAccessDeniedError
} = require("@responses/common/error-handler.response");
const { CONFLICT, BAD_REQUEST, NOT_FOUND } = require("@configs/http-status.config");

/**
 * PATCH /org-project-requests/:requestId/reject
 * Reject an org project request (project owner/manager only)
 */
const rejectOrgProjectRequestController = async (req, res) => {
  try {
    logWithTime(`[rejectOrgProjectRequestController] Rejecting request: ${req.orgProjectRequest._id}`);

    const request = req.orgProjectRequest;
    const { rejectReasonType, rejectReasonDescription } = req.body;
    const updatedBy = req.adminId || req.user?.adminId;

    const result = await rejectOrgProjectRequestService({
      request,
      rejectReasonType,
      rejectReasonDescription,
      updatedBy
    });

    if (!result.success) {
      logWithTime(
        `❌ [rejectOrgProjectRequestController] ${result.message} | ${getLogIdentifiers(req)}`
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
      `✅ [rejectOrgProjectRequestController] Request rejected successfully | ${getLogIdentifiers(req)}`
    );
    return sendOrgProjectRequestRejectedSuccess(res, result.request);

  } catch (error) {
    logWithTime(
      `❌ [rejectOrgProjectRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { rejectOrgProjectRequestController };
