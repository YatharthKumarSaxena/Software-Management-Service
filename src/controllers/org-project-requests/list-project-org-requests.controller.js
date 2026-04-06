// controllers/clients/org-project-requests/list-project-org-requests.controller.js

const { listProjectOrgRequestsService } = require("@services/org-project-requests");
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
 * GET /projects/:projectId/org-requests
 * List all org project requests for a specific project (manager only)
 */
const listProjectOrgRequestsController = async (req, res) => {
  try {
    logWithTime(`[listProjectOrgRequestsController] Listing requests for project: ${req.params.projectId}`);

    const { projectId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const result = await listProjectOrgRequestsService({
      projectId,
      status: status || null,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    if (!result.success) {
      logWithTime(
        `❌ [listProjectOrgRequestsController] ${result.message} | ${getLogIdentifiers(req)}`
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
      `✅ [listProjectOrgRequestsController] Requests listed successfully | ${getLogIdentifiers(req)}`
    );
    return sendOrgProjectRequestsListSuccess(res, result.requests, result.total, result.page, result.limit);

  } catch (error) {
    logWithTime(
      `❌ [listProjectOrgRequestsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { listProjectOrgRequestsController };
