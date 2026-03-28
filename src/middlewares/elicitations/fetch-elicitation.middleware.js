// middlewares/elicitations/fetch-elicitation.middleware.js

const { ElicitationModel } = require("@models/elicitation.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * fetchElicitationMiddleware
 *
 * Validates the `:elicitationId` route param, fetches the elicitation from DB,
 * and attaches it to `req.elicitation` and ensures `req.projectId` is set.
 *
 * Returns 400 if elicitationId is missing or malformed.
 * Returns 404 if no elicitation exists with that id.
 * Returns 400 if the elicitation is soft-deleted (isDeleted === true).
 *
 * Usage in route chain:
 *   router.patch(ROUTE, [...authMiddlewares, fetchElicitationMiddleware, fetchProjectMiddleware, ...otherMiddlewares], controller)
 */
const fetchElicitationMiddleware = async (req, res, next) => {
  try {
    const elicitationId = req?.params?.elicitationId;

    // ── Guard: elicitationId must be present ────────────────────────────────────
    if (!elicitationId) {
      logMiddlewareError("fetchElicitationMiddleware", "elicitationId is missing", req);
      return throwBadRequestError(res, "elicitationId is required");
    }

    // ── Guard: elicitationId must be a valid MongoDB ID ─────────────────────────
    if (!isValidMongoID(elicitationId)) {
      logMiddlewareError("fetchElicitationMiddleware", `Invalid MongoDB ID format: ${elicitationId}`, req);
      return throwBadRequestError(res, "Invalid elicitationId format");
    }

    // ── Fetch elicitation from DB using lean() ─────────────────────────────────
    const elicitation = await ElicitationModel.findById(elicitationId).lean();

    // ── Guard: elicitation must exist ───────────────────────────────────────────
    if (!elicitation) {
      logMiddlewareError("fetchElicitationMiddleware", `Elicitation not found: ${elicitationId}`, req);
      return throwDBResourceNotFoundError(res, "Elicitation", elicitationId);
    }

    // ── Guard: elicitation must not be soft-deleted ──────────────────────────────
    if (elicitation.isDeleted === true) {
      logMiddlewareError(
        "fetchElicitationMiddleware",
        `Elicitation is deleted: ${elicitationId}`,
        req
      );
      return throwBadRequestError(res, "Elicitation has been deleted");
    }

    // ── Attach elicitation and projectId to request ──────────────────────────────
    req.elicitation = elicitation;
    req.projectId = elicitation.projectId.toString();

    logWithTime(`✅ [fetchElicitationMiddleware] Elicitation fetched: ${elicitationId}`);
    return next();

  } catch (error) {
    logMiddlewareError("fetchElicitationMiddleware", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchElicitationMiddleware };
