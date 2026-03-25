// middlewares/inceptions/fetch-inception.middleware.js

const { InceptionModel } = require("@models/inception.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwMissingFieldsError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * fetchInceptionMiddleware
 *
 * Validates the `:inceptionId` route param, fetches the inception from DB,
 * and attaches it to `req.inception` for downstream middlewares and controllers.
 *
 * Returns 400 if inceptionId is missing or malformed.
 * Returns 404 if no inception exists with that id or is soft-deleted.
 *
 * Usage in route chain:
 *   router.delete(ROUTE, [...authMiddlewares, fetchInceptionMiddleware, ...otherMiddlewares], controller)
 */
const fetchInceptionMiddleware = async (req, res, next) => {
  try {
    const inceptionId = req?.params?.inceptionId;

    // ──1. Param presence ────────────────────────────────────────────
    if (!inceptionId) {
        logMiddlewareError("fetchInceptionMiddleware", "Missing inceptionId in route params", req);
      return throwMissingFieldsError(res, ["inceptionId"]);
    }

    // ── 2. Format validation ─────────────────────────────────────────
    if (!isValidMongoID(inceptionId)) {
        logMiddlewareError("fetchInceptionMiddleware", `Invalid inceptionId format: ${inceptionId}`, req);
      return throwBadRequestError(
        res,
        "Invalid inceptionId format",
        "inceptionId must be a valid MongoDB ObjectId string."
      );
    }

    // ── 3. DB lookup ─────────────────────────────────────────────────
    const inception = await InceptionModel.findOne({ _id: inceptionId, isDeleted: false }).lean();

    if (!inception) {
        logMiddlewareError("fetchInceptionMiddleware", `Inception not found for id: ${inceptionId}`, req);
      return throwDBResourceNotFoundError(res, "Inception");
    }

    // ── 4. Attach and continue ───────────────────────────────────────
    logWithTime(`✅ Inception fetched successfully: ${inception._id}`);
    req.inception = inception;
    req.projectId = inception.projectId; // Attach projectId for any controllers that might need it
    
    return next();

  } catch (error) {
    logMiddlewareError("fetchInceptionMiddleware", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchInceptionMiddleware };
