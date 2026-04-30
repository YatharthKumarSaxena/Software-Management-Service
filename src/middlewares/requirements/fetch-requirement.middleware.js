// middlewares/requirements/fetch-requirement.middleware.js

const { RequirementModel } = require("@models/requirement.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * fetchRequirementMiddleware
 *
 * Validates the `:requirementId` route param, fetches the requirement from DB,
 * and attaches it to `req.requirement`. Ensures requirement is not soft-deleted.
 *
 * Returns 400 if requirementId is missing or malformed.
 * Returns 404 if no requirement exists with that id.
 * Returns 400 if the requirement is soft-deleted (isDeleted === true).
 *
 * Usage in route chain:
 *   router.get(ROUTE, [...authMiddlewares, fetchRequirementMiddleware, ...otherMiddlewares], controller)
 */
const fetchRequirementMiddleware = async (req, res, next) => {
  try {
    const requirementId = req?.params?.requirementId;

    // ── Guard: requirementId must be present ────────────────────────────────────
    if (!requirementId) {
      logMiddlewareError("fetchRequirementMiddleware", "requirementId is missing", req);
      return throwBadRequestError(res, "requirementId is required");
    }

    // ── Guard: requirementId must be a valid MongoDB ID ─────────────────────────
    if (!isValidMongoID(requirementId)) {
      logMiddlewareError("fetchRequirementMiddleware", `Invalid MongoDB ID format: ${requirementId}`, req);
      return throwBadRequestError(res, "Invalid requirementId format");
    }

    // ── Fetch requirement from DB using lean() ─────────────────────────────────
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false }).lean();

    // ── Guard: requirement must exist ───────────────────────────────────────────
    if (!requirement) {
      logMiddlewareError("fetchRequirementMiddleware", `Requirement not found: ${requirementId}`, req);
      return throwDBResourceNotFoundError(res, "Requirement", requirementId);
    }

    // ── Attach requirement to request ──────────────────────────────────
    req.requirement = requirement;

    logWithTime(`✅ [fetchRequirementMiddleware] Requirement fetched: ${requirementId}`);
    return next();

  } catch (error) {
    logMiddlewareError("fetchRequirementMiddleware", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchRequirementMiddleware };
