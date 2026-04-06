// controllers/clients/org-project-requests/list-my-org-project-requests.controller.js

const { listMyOrgProjectRequestsService } = require("@services/org-project-requests");
const { logWithTime } = require("@utils/time-stamps.util");
const { getLogIdentifiers } = require("@responses/common/error-handler.response");
const { sendOrgProjectRequestsListSuccess } = require("@responses/success/org-project-request.response");
const {
  throwBadRequestError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwAccessDeniedError
} = require("@responses/common/error-handler.response");
const { CONFLICT, BAD_REQUEST, NOT_FOUND } = require("@configs/http-status.config");

/**
 * GET /org-project-requests
 * List all org project requests for authenticated client
 */
const listMyOrgProjectRequestsController = async (req, res) => {
  try {
    logWithTime(`[listMyOrgProjectRequestsController] Listing requests`);

    const clientId = req.clientId || req.user?.clientId;
    const { status, page = 1, limit = 10 } = req.query;

    const result = await listMyOrgProjectRequestsService({
      clientId,
      status: status || null,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    if (!result.success) {
      logWithTime(
        `❌ [listMyOrgProjectRequestsController] ${result.message} | ${getLogIdentifiers(req)}`
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
      `✅ [listMyOrgProjectRequestsController] Requests listed successfully | ${getLogIdentifiers(req)}`
    );
    return sendOrgProjectRequestsListSuccess(res, result.requests, result.total, result.page, result.limit);

  } catch (error) {
    logWithTime(
      `❌ [listMyOrgProjectRequestsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { listMyOrgProjectRequestsController };
