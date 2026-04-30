// middlewares/requirements/fetch-requirement.middleware.js

const { FeatureRequirementMappingModel } = require("@models/feature-requirement-map.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * fetchFeatureRequirementMappingMiddleware
 *
 * Validates the `:mappingId` route param, fetches the feature requirement mapping from DB,
 * and attaches it to `req.mapping`. Ensures mapping is not soft-deleted.
 *
 * Returns 400 if mappingId is missing or malformed.
 * Returns 404 if no mapping exists with that id.
 * Returns 400 if the feature requirement mapping is soft-deleted (isDeleted === true).
 *
 * Usage in route chain:
 *   router.get(ROUTE, [...authMiddlewares, fetchFeatureRequirementMappingMiddleware, ...otherMiddlewares], controller)
 */
const fetchFeatureRequirementMappingMiddleware = async (req, res, next) => {
  try {
    const mappingId = req?.params?.mappingId;

    // ── Guard: mappingId must be present ────────────────────────────────────
    if (!mappingId) {
      logMiddlewareError("fetchFeatureRequirementMappingMiddleware", "mappingId is missing", req);
      return throwBadRequestError(res, "mappingId is required");
    }

    // ── Guard: mappingId must be a valid MongoDB ID ─────────────────────────
    if (!isValidMongoID(mappingId)) {
      logMiddlewareError("fetchFeatureRequirementMappingMiddleware", `Invalid MongoDB ID format: ${mappingId}`, req);
      return throwBadRequestError(res, "Invalid mappingId format");
    }

    // ── Fetch feature requirement mapping from DB using lean() ─────────────────────────────────
    const mapping = await FeatureRequirementMappingModel.findOne({ _id: mappingId, isDeleted: false }).lean();

    // ── Guard: mapping must exist ───────────────────────────────────────────
    if (!mapping) {
      logMiddlewareError("fetchFeatureRequirementMappingMiddleware", `Feature requirement mapping not found: ${mappingId}`, req);
      return throwDBResourceNotFoundError(res, "Feature requirement mapping", mappingId);
    }

    // ── Attach mapping to request ──────────────────────────────────
    req.mapping = mapping;

    logWithTime(`✅ [fetchFeatureRequirementMappingMiddleware] Feature requirement mapping fetched: ${mappingId}`);
    return next();

  } catch (error) {
    logMiddlewareError("fetchFeatureRequirementMappingMiddleware", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchFeatureRequirementMappingMiddleware };
