// middlewares/product-requests/fetch-product-request.middleware.js

const { ProductRequestModel } = require("@models/product-request.model");
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
 * fetchProductRequestMiddleware
 *
 * Validates the `:requestId` route param, fetches the product request from DB,
 * and attaches it to `req.productRequest` for downstream middlewares and controllers.
 *
 * Checks the combo: by ID (isValidMongoID) AND isDeleted === false
 *
 * Returns 400 if requestId is missing or malformed.
 * Returns 404 if no active product request exists with that id.
 * Returns 400 if the product request is soft-deleted (isDeleted === true).
 *
 * Usage in route chain:
 *   router.patch(ROUTE, [...authMiddlewares, fetchProductRequestMiddleware, ...otherMiddlewares], controller)
 */
const fetchProductRequestMiddleware = async (req, res, next) => {
  try {
    const requestId = req?.params?.requestId || req?.body?.requestId;

    // ── 1. Param presence ────────────────────────────────────────────
    if (!requestId) {
      logMiddlewareError("fetchProductRequestMiddleware", "Missing requestId in params or body", req);
      return throwMissingFieldsError(res, ["requestId"]);
    }

    // ── 2. Format validation ─────────────────────────────────────────
    if (!isValidMongoID(requestId)) {
      logMiddlewareError("fetchProductRequestMiddleware", `Invalid requestId format: ${requestId}`, req);
      return throwBadRequestError(
        res,
        "Invalid requestId format",
        "requestId must be a valid MongoDB ObjectId string."
      );
    }

    // ── 3. DB lookup with isDeleted check ────────────────────────────
    const productRequest = await ProductRequestModel.findOne({
      _id: requestId,
      isDeleted: false
    });

    if (!productRequest) {
      logMiddlewareError("fetchProductRequestMiddleware", `Product request not found or is deleted: ${requestId}`, req);
      return throwDBResourceNotFoundError(res, "Product Request");
    }

    // ── 4. Attach and continue ───────────────────────────────────────
    logWithTime(`✅ Product request fetched successfully: ${productRequest._id}`);
    req.productRequest = productRequest;
    return next();

  } catch (error) {
    logMiddlewareError("fetchProductRequestMiddleware", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchProductRequestMiddleware };
