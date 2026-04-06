// controllers/clients/org-project-requests/approve-org-project-request.controller.js

const { approveOrgProjectRequestService } = require("@services/org-project-requests");
const { logWithTime } = require("@utils/time-stamps.util");
const { getLogIdentifiers } = require("@responses/common/error-handler.response");
const { sendOrgProjectRequestApprovedSuccess } = require("@responses/success/org-project-request.response");
const {
  throwBadRequestError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwAccessDeniedError
} = require("@responses/common/error-handler.response");
const { CONFLICT, BAD_REQUEST, NOT_FOUND } = require("@configs/http-status.config");

/**
 * PATCH /org-project-requests/:requestId/approve
 * Approve an org project request (project owner/manager only)
 */
const approveOrgProjectRequestController = async (req, res) => {
  try {
    logWithTime(`[approveOrgProjectRequestController] Approving request: ${req.orgProjectRequest._id}`);

    const request = req.orgProjectRequest;
    const { approveReasonType, approveReasonDescription } = req.body;
    const updatedBy = req.adminId || req.user?.adminId;

    const result = await approveOrgProjectRequestService({
      request,
      approveReasonType,
      approveReasonDescription,
      updatedBy
    });

    if (!result.success) {
      logWithTime(
        `❌ [approveOrgProjectRequestController] ${result.message} | ${getLogIdentifiers(req)}`
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
      `✅ [approveOrgProjectRequestController] Request approved successfully | ${getLogIdentifiers(req)}`
    );
    return sendOrgProjectRequestApprovedSuccess(res, result.request);

  } catch (error) {
    logWithTime(
      `❌ [approveOrgProjectRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { approveOrgProjectRequestController };
