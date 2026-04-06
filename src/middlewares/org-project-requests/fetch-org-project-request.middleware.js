// middlewares/org-project-requests/fetch-org-project-request.middleware.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * fetchOrgProjectRequestMiddleware
 *
 * Validates the `:requestId` route param, fetches the org project request from DB,
 * and attaches it to `req.orgProjectRequest`.
 *
 * Returns 400 if requestId is missing or malformed.
 * Returns 404 if no org project request exists with that id.
 *
 * Usage in route chain:
 *   router.patch(ROUTE, [...authMiddlewares, fetchOrgProjectRequestMiddleware, ...otherMiddlewares], controller)
 */
const fetchOrgProjectRequestMiddleware = async (req, res, next) => {
  try {
    const requestId = req?.params?.requestId;

    // ── Guard: requestId must be present ────────────────────────────────────
    if (!requestId) {
      logMiddlewareError("fetchOrgProjectRequestMiddleware", "requestId is missing", req);
      return throwBadRequestError(res, "requestId is required");
    }

    // ── Guard: requestId must be a valid MongoDB ID ─────────────────────────
    if (!isValidMongoID(requestId)) {
      logMiddlewareError("fetchOrgProjectRequestMiddleware", `Invalid MongoDB ID format: ${requestId}`, req);
      return throwBadRequestError(res, "Invalid requestId format");
    }

    // ── Fetch org project request from DB using lean() ──────────────────────
    const orgProjectRequest = await OrgProjectRequest.findById(requestId).lean();

    // ── Guard: org project request must exist ───────────────────────────────
    if (!orgProjectRequest) {
      logMiddlewareError("fetchOrgProjectRequestMiddleware", `Org project request not found: ${requestId}`, req);
      return throwDBResourceNotFoundError(res, "Org Project Request", requestId);
    }

    // ── Attach org project request to request ───────────────────────────────
    req.orgProjectRequest = orgProjectRequest;

    logWithTime(`✅ [fetchOrgProjectRequestMiddleware] Org project request fetched: ${requestId}`);
    return next();

  } catch (error) {
    logMiddlewareError("fetchOrgProjectRequestMiddleware", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchOrgProjectRequestMiddleware };
